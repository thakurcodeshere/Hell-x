import { describe, it, expect } from "vitest";
import { ExecutionGateEvaluator } from "../src/governance/exec-gate.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";
import { EventBus } from "../src/storage/event-bus.js";
import { OrchestratorTask } from "../src/orchestrator/types.js";

describe("ExecutionGateEvaluator (Layer 09 / Phase 4)", () => {
  it("approves execution gate when all tasks have valid independent verification evidence", async () => {
    const store = new ArtifactStore();
    await store.initialize();
    const bus = new EventBus();
    await bus.initialize();

    const tasks: OrchestratorTask[] = [
      {
        id: "t1",
        code: "TASK-DB-USERS",
        title: "DB Task",
        description: "DB",
        targetRole: "DATABASE_ENGINEER",
        status: "VERIFIED",
        priority: "HIGH",
        dependencies: [],
        submission: {
          taskId: "t1",
          workerId: "agent-db-01",
          workerRole: "DATABASE_ENGINEER",
          gitCommitHash: "abc1",
          changedFiles: ["migrations/001.sql"],
          testOutputSummary: "Applied",
          submittedAt: new Date().toISOString(),
        },
        verification: {
          taskId: "t1",
          verifierId: "agent-qa-01",
          verifierRole: "QA_ENGINEER",
          status: "PASSED",
          testsPassed: true,
          securityAuditPassed: true,
          evidenceId: "art-evid-01",
          evidenceHash: "sha256-hash-proof",
          reviewNotes: "Clean migration with rollback script",
          verifiedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const gate = new ExecutionGateEvaluator(store, bus);
    const result = await gate.evaluateExecutionReadiness({
      gateId: "gate-exec-01",
      tasks,
      evaluatorActor: {
        id: "release-lead",
        name: "Release Lead",
        type: "SYSTEM_EVALUATOR",
        role: "RELEASE_ENGINEER",
        permissions: ["GATE_APPROVE"],
      },
      justification: "All tasks independently verified with attached cryptographic evidence.",
    });

    expect(result.status).toBe("PASSED");
    expect(result.violations.length).toBe(0);
  });
});
