import { describe, it, expect } from "vitest";
import { DeploymentEngine } from "../src/release/deployment-engine.js";
import { DeploymentPlan } from "../src/release/types.js";

describe("DeploymentEngine (Phase 6 / Section 23 & 24)", () => {
  const plan: DeploymentPlan = {
    id: "plan-01",
    releaseVersion: "v1.2.0",
    targetEnvironment: "PRODUCTION",
    strategy: "CANARY",
    targetCommitHash: "c0ffee123",
    sloThresholds: {
      maxErrorRate: 0.001,
      maxP99LatencyMs: 150,
      maxCpuUtilization: 0.8,
      maxMemoryUtilization: 0.85,
    },
    rollbackPlan: {
      id: "rb-01",
      targetVersion: "v1.1.9",
      previousStableCommitHash: "deadbeef00",
      trafficReversionTarget: "PREVIOUS_STABLE",
      estimatedRollbackTimeSeconds: 1,
    },
    authorId: "release-lead",
    authorRole: "RELEASE_ENGINEER",
    createdAt: new Date().toISOString(),
  };

  it("progresses canary stages when telemetry remains healthy", async () => {
    const engine = new DeploymentEngine();
    const deployment = engine.initializeDeployment(plan);

    expect(deployment.currentState).toBe("GATE_APPROVED");
    expect(deployment.trafficPercentage).toBe(0);

    // Step 1: 10%
    const res1 = await engine.progressCanary(deployment.id, {
      totalRequests: 1000,
      errorCount: 0,
      p50LatencyMs: 20,
      p95LatencyMs: 60,
      p99LatencyMs: 95,
      cpuUtilization: 0.3,
      memoryUtilization: 0.4,
      http5xxCount: 0,
    });
    expect(res1.status.currentState).toBe("CANARY_10_PERCENT");
    expect(res1.status.trafficPercentage).toBe(10);

    // Step 2: 25%
    const res2 = await engine.progressCanary(deployment.id, {
      totalRequests: 2500,
      errorCount: 1,
      p50LatencyMs: 22,
      p95LatencyMs: 65,
      p99LatencyMs: 105,
      cpuUtilization: 0.35,
      memoryUtilization: 0.42,
      http5xxCount: 1,
    });
    expect(res2.status.currentState).toBe("CANARY_25_PERCENT");
    expect(res2.status.trafficPercentage).toBe(25);
  });

  it("halts and transitions to ROLLING_BACK if telemetry degrades", async () => {
    const engine = new DeploymentEngine();
    const deployment = engine.initializeDeployment(plan);

    // Canary step with 10% error spike
    const res = await engine.progressCanary(deployment.id, {
      totalRequests: 1000,
      errorCount: 100, // 10% error rate >> 0.1%
      p50LatencyMs: 400,
      p95LatencyMs: 800,
      p99LatencyMs: 1200,
      cpuUtilization: 0.95,
      memoryUtilization: 0.9,
      http5xxCount: 100,
    });

    expect(res.status.currentState).toBe("ROLLING_BACK");
    expect(res.health.isHealthy).toBe(false);
  });
});
