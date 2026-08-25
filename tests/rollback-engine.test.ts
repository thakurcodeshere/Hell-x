import { describe, it, expect } from "vitest";
import { RollbackEngine } from "../src/release/rollback-engine.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";
import { EventBus } from "../src/storage/event-bus.js";
import { DeploymentPlan, DeploymentStatusRecord } from "../src/release/types.js";

describe("RollbackEngine & Post-Mortem Capture (Phase 6 / Section 26)", () => {
  it("executes fast rollback and persists FAILURE_MEMORY artifact", async () => {
    const store = new ArtifactStore();
    await store.initialize();
    const bus = new EventBus();
    await bus.initialize();

    const plan: DeploymentPlan = {
      id: "plan-rb-01",
      releaseVersion: "v2.0.0",
      targetEnvironment: "PRODUCTION",
      strategy: "CANARY",
      targetCommitHash: "c0ffee999",
      sloThresholds: {
        maxErrorRate: 0.001,
        maxP99LatencyMs: 150,
        maxCpuUtilization: 0.8,
        maxMemoryUtilization: 0.85,
      },
      rollbackPlan: {
        id: "rb-01",
        targetVersion: "v1.9.9",
        previousStableCommitHash: "deadbeef11",
        trafficReversionTarget: "PREVIOUS_STABLE",
        estimatedRollbackTimeSeconds: 1,
      },
      authorId: "rel-lead",
      authorRole: "RELEASE_ENGINEER",
      createdAt: new Date().toISOString(),
    };

    const deployment: DeploymentStatusRecord = {
      id: "deploy-fail-01",
      planId: plan.id,
      currentState: "ROLLING_BACK",
      trafficPercentage: 25,
      activeCanaryStage: 2,
      healthMetricsHistory: [],
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const engine = new RollbackEngine(store, bus);
    const postMortem = await engine.executeFastRollback(
      deployment,
      plan,
      "P99 latency spiked to 450ms during 25% canary"
    );

    expect(deployment.currentState).toBe("ROLLED_BACK");
    expect(deployment.trafficPercentage).toBe(0);
    expect(postMortem.memoryArtifact.category).toBe("FAILURE_MEMORY");
    expect(postMortem.memoryArtifact.code).toContain("MEM-FAIL-");
    expect(store.getByCode(postMortem.memoryArtifact.code)?.id).toBe(postMortem.memoryArtifact.id);
  });
});
