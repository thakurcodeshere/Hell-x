import { describe, it, expect } from "vitest";
import { SoftwareHealthModel } from "../src/observability/software-health.js";

describe("Digital Software Health Model (Milestone 14 / Section 41)", () => {
  it("evaluates telemetry health state transitions from HEALTHY to WATCH, DEGRADING, and CRITICAL", () => {
    const model = new SoftwareHealthModel();

    // 1. Healthy baseline
    const healthy = model.evaluateHealth({
      p99LatencyMs: 45,
      errorRatePercent: 0.001,
      cpuUtilizationPercent: 30,
      memoryUtilizationPercent: 40,
      dbReplicationLagMs: 15,
      unresolvedIncidentsCount: 0,
    });
    expect(healthy.currentState).toBe("HEALTHY");
    expect(healthy.healthIndexScore).toBeGreaterThanOrEqual(0.95);

    // 2. High latency degradation
    const watch = model.evaluateHealth({
      p99LatencyMs: 85,
      errorRatePercent: 0.001,
      cpuUtilizationPercent: 55,
      memoryUtilizationPercent: 60,
      dbReplicationLagMs: 50,
      unresolvedIncidentsCount: 0,
    });
    expect(watch.currentState).toBe("WATCH");

    // 3. Catastrophic error rate spike
    const critical = model.evaluateHealth({
      p99LatencyMs: 650,
      errorRatePercent: 2.5,
      cpuUtilizationPercent: 95,
      memoryUtilizationPercent: 92,
      dbReplicationLagMs: 500,
      unresolvedIncidentsCount: 1,
    });
    expect(critical.currentState).toBe("CRITICAL");
    expect(critical.activeAnomalies.length).toBeGreaterThanOrEqual(2);
    expect(critical.recommendedActions).toContain("Initiate sub-second Fast-Rollback Sentinel.");
  });
});
