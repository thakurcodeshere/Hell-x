/**
 * Hell-x Tests: Causal Engineering Graph (Step 21)
 */
import { describe, it, expect } from "vitest";
import { CausalEngineeringGraph } from "../src/analytics/causal-graph.js";

describe("CausalEngineeringGraph — Root Cause Attribution & Counterfactuals (Step 21)", () => {
  it("traces upstream causal DAG from conversion drop to commit root cause", () => {
    const graph = new CausalEngineeringGraph();

    // 1. Root commit
    graph.addNode({
      id: "commit-4f81",
      name: "commit: unindexed foreign key in checkout",
      type: "CODE_COMMIT",
      observedValue: 1,
      baselineValue: 0,
      anomalyZScore: 3.5,
    });

    // 2. DB CPU Saturation
    graph.addNode({
      id: "metric-db-cpu",
      name: "PostgreSQL CPU Saturation %",
      type: "DB_CPU_SATURATION",
      observedValue: 98,
      baselineValue: 22,
      anomalyZScore: 4.8,
    });

    // 3. API Latency Spike
    graph.addNode({
      id: "metric-api-p99",
      name: "Checkout API P99 Latency (ms)",
      type: "SERVICE_LATENCY",
      observedValue: 1450,
      baselineValue: 65,
      anomalyZScore: 5.2,
    });

    // 4. Conversion drop symptom
    graph.addNode({
      id: "metric-checkout-conv",
      name: "Checkout Funnel Conversion Rate %",
      type: "CONVERSION_DROP",
      observedValue: 42,
      baselineValue: 78,
      anomalyZScore: -4.1,
    });

    // Causal links with coefficients
    graph.addEdge({
      fromNodeId: "commit-4f81",
      toNodeId: "metric-db-cpu",
      causalCoefficient: 0.94,
      confidence: 0.99,
      evidenceSource: "pg_stat_activity sequential scan logs",
    });

    graph.addEdge({
      fromNodeId: "metric-db-cpu",
      toNodeId: "metric-api-p99",
      causalCoefficient: 0.91,
      confidence: 0.98,
      evidenceSource: "distributed trace database wait span",
    });

    graph.addEdge({
      fromNodeId: "metric-api-p99",
      toNodeId: "metric-checkout-conv",
      causalCoefficient: -0.88,
      confidence: 0.95,
      evidenceSource: "session abandonment funnel analytics",
    });

    // Trace from symptom back to root cause
    const report = graph.traceRootCause("metric-checkout-conv");

    expect(report.rootCauseNode.id).toBe("commit-4f81");
    expect(report.rootCauseNode.type).toBe("CODE_COMMIT");
    expect(report.causalPath).toEqual([
      "commit-4f81",
      "metric-db-cpu",
      "metric-api-p99",
      "metric-checkout-conv",
    ]);
    expect(report.counterfactualEstimatedRecovery.expectedImprovementPercent).toBeCloseTo(46.15, 1);
  });
});
