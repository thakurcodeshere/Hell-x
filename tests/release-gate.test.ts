import { describe, it, expect } from "vitest";
import { ReleaseGateEvaluator } from "../src/governance/release-gate.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";
import { EventBus } from "../src/storage/event-bus.js";
import { DeploymentPlan } from "../src/release/types.js";

describe("ReleaseGateEvaluator (Layer 09 / Phase 6)", () => {
  it("approves release candidate when evidence and rollback plan are valid", async () => {
    const store = new ArtifactStore();
    await store.initialize();
    const bus = new EventBus();
    await bus.initialize();

    const plan: DeploymentPlan = {
      id: "plan-rel-01",
      releaseVersion: "v1.0.0",
      targetEnvironment: "PRODUCTION",
      strategy: "CANARY",
      targetCommitHash: "commit-abc",
      sloThresholds: {
        maxErrorRate: 0.001,
        maxP99LatencyMs: 150,
        maxCpuUtilization: 0.8,
        maxMemoryUtilization: 0.85,
      },
      rollbackPlan: {
        id: "rb-01",
        targetVersion: "v0.9.0",
        previousStableCommitHash: "commit-prev",
        trafficReversionTarget: "PREVIOUS_STABLE",
        estimatedRollbackTimeSeconds: 1,
      },
      authorId: "rel-lead",
      authorRole: "RELEASE_ENGINEER",
      createdAt: new Date().toISOString(),
    };

    const gate = new ReleaseGateEvaluator(store, bus);
    const result = await gate.evaluateReleaseReadiness({
      gateId: "gate-rel-01",
      deploymentPlan: plan,
      attachedEvidenceIds: ["art-evid-01"],
      evaluatorActor: {
        id: "release-lead",
        name: "Release Lead",
        type: "SYSTEM_EVALUATOR",
        role: "RELEASE_ENGINEER",
        permissions: ["GATE_APPROVE"],
      },
      justification: "Complete evidence attached and verified sub-second rollback plan.",
    });

    expect(result.status).toBe("PASSED");
    expect(result.violations.length).toBe(0);
  });
});
