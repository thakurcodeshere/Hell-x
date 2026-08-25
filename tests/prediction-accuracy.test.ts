/**
 * Hell-x Tests: Prediction Accuracy Engine (Step 12)
 */
import { describe, it, expect } from "vitest";
import { PredictionAccuracyEngine } from "../src/memory/prediction-accuracy.js";

describe("PredictionAccuracyEngine — Engineering Prediction Memory (Step 12)", () => {
  it("records prediction error and bounds precision", () => {
    const engine = new PredictionAccuracyEngine();
    const rec = engine.record({
      missionId: "mission-101",
      domain: "P95_LATENCY_MS",
      predictedValue: 120,
      actualValue: 100,
      context: ["api", "checkout"],
    });

    expect(rec.predictionError).toBe(0.2); // |120-100|/100 = 0.2
    expect(rec.domain).toBe("P95_LATENCY_MS");
    expect(engine.getRecords("P95_LATENCY_MS").length).toBe(1);
  });

  it("calibrates over-estimating predictions and provides correction factor", () => {
    const engine = new PredictionAccuracyEngine();
    // System systematically predicts 150ms when actual is 100ms (+50% overestimate)
    for (let i = 0; i < 5; i++) {
      engine.record({
        missionId: `mission-${i}`,
        domain: "P95_LATENCY_MS",
        predictedValue: 150,
        actualValue: 100,
        context: ["latency"],
      });
    }

    const report = engine.calibrate("P95_LATENCY_MS");
    expect(report.recordCount).toBe(5);
    expect(report.biasDirection).toBe("OVER_ESTIMATE");
    expect(report.averageSignedError).toBeCloseTo(0.5, 2);
    expect(report.recommendation).toContain("OVER-estimating");
    expect(report.recommendation).toContain("correction factor");
  });

  it("calibrates under-estimating predictions and provides correction factor", () => {
    const engine = new PredictionAccuracyEngine();
    // System systematically predicts $0.02 when actual is $0.05
    for (let i = 0; i < 4; i++) {
      engine.record({
        missionId: `cost-mission-${i}`,
        domain: "COST_USD",
        predictedValue: 0.02,
        actualValue: 0.05,
        context: ["token-spend"],
      });
    }

    const report = engine.calibrate("COST_USD");
    expect(report.biasDirection).toBe("UNDER_ESTIMATE");
    expect(report.recommendation).toContain("UNDER-estimating");
  });

  it("returns balanced calibration when predictions are well-calibrated", () => {
    const engine = new PredictionAccuracyEngine();
    engine.record({
      missionId: "m1",
      domain: "RISK_SCORE",
      predictedValue: 0.45,
      actualValue: 0.46,
      context: ["risk"],
    });
    engine.record({
      missionId: "m2",
      domain: "RISK_SCORE",
      predictedValue: 0.80,
      actualValue: 0.79,
      context: ["risk"],
    });

    const report = engine.calibrate("RISK_SCORE");
    expect(report.calibrationScore).toBeGreaterThan(0.95);
    expect(report.biasDirection).toBe("BALANCED");
    expect(report.recommendation).toContain("Excellent calibration");
  });

  it("calibrateAll runs across all 5 prediction domains", () => {
    const engine = new PredictionAccuracyEngine();
    const reports = engine.calibrateAll();
    expect(reports.length).toBe(5);
    const domainNames = reports.map((r) => r.domain);
    expect(domainNames).toContain("P95_LATENCY_MS");
    expect(domainNames).toContain("COST_USD");
    expect(domainNames).toContain("DEFECT_RATE_PERCENT");
    expect(domainNames).toContain("MISSION_DURATION_MS");
    expect(domainNames).toContain("RISK_SCORE");
  });
});
