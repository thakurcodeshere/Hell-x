import { describe, it, expect } from "vitest";
import { PeerVerifier } from "../src/orchestrator/peer-verifier.js";
import { OrchestratorTask } from "../src/orchestrator/types.js";
import { SelfReviewViolationError } from "../src/core/errors.js";

describe("PeerVerifier (Primary Principle & Independent Review)", () => {
  const verifier = new PeerVerifier();

  it("strictly rejects self-review attempts by the creator agent", async () => {
    const task: OrchestratorTask = {
      id: "task-01",
      code: "TASK-API-01",
      title: "API",
      description: "API",
      targetRole: "BACKEND_SPECIALIST",
      status: "SUBMITTED",
      priority: "HIGH",
      dependencies: [],
      submission: {
        taskId: "task-01",
        workerId: "agent-backend-01",
        workerRole: "BACKEND_SPECIALIST",
        gitCommitHash: "c0ffee",
        changedFiles: ["src/api.ts"],
        testOutputSummary: "All tests pass",
        submittedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Attempt self-review with workerId = verifierId
    await expect(
      verifier.verifySubmission({
        task,
        verifierId: "agent-backend-01",
        verifierRole: "BACKEND_SPECIALIST",
        testSuccess: true,
        securityPassed: true,
        reviewNotes: "Looks good to me",
      })
    ).rejects.toThrow(SelfReviewViolationError);
  });

  it("approves and generates evidence when verified by an independent QA agent", async () => {
    const task: OrchestratorTask = {
      id: "task-02",
      code: "TASK-API-02",
      title: "API",
      description: "API",
      targetRole: "BACKEND_SPECIALIST",
      status: "SUBMITTED",
      priority: "HIGH",
      dependencies: [],
      submission: {
        taskId: "task-02",
        workerId: "agent-backend-01",
        workerRole: "BACKEND_SPECIALIST",
        gitCommitHash: "c0ffee",
        changedFiles: ["src/api.ts"],
        testOutputSummary: "All tests pass",
        submittedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const evidence = await verifier.verifySubmission({
      task,
      verifierId: "agent-qa-01",
      verifierRole: "QA_ENGINEER",
      testSuccess: true,
      securityPassed: true,
      reviewNotes: "Verified all unit & integration tests pass with zero regression.",
    });

    expect(evidence.verifiedPassed).toBe(true);
    expect(task.status).toBe("VERIFIED");
    expect(task.verification?.evidenceHash).toBeDefined();
  });
});
