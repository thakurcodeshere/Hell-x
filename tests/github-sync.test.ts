import { describe, it, expect } from "vitest";
import { GitHubPRSyncer } from "../src/sandbox/github-sync.js";
import { RequirementArtifact, EvidenceArtifact, GateDecisionArtifact } from "../src/core/artifacts.js";

describe("GitHubPRSyncer (Milestone 9)", () => {
  const syncer = new GitHubPRSyncer();

  it("generates markdown tables for requirements, evidence, and gates", () => {
    const req: RequirementArtifact = {
      id: "req-01",
      type: "REQUIREMENT",
      code: "REQ-PAYM-001",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "pm-1",
      authorRole: "PRODUCT_MANAGER",
      title: "Idempotent Payment Charge",
      objective: "Enforce idempotency",
      actor: "Customer",
      trigger: "Checkout",
      preconditions: [],
      workflow: [],
      expectedResult: "Charge processed",
      edgeCases: [],
      constraints: [],
      acceptanceCriteria: [],
      verificationMethod: "Automated Suite",
      riskLevel: "HIGH",
      completenessRadar: { functional: 1, ux: 1, data: 1, security: 1, operational: 1, errorHandling: 1, compliance: 1, observability: 1 },
      explicitUnknowns: [],
      status: "VALIDATED",
      dependencies: [],
      tags: ["payment"],
      immutable: true,
    };

    const evidence: EvidenceArtifact = {
      id: "evid-01",
      type: "EVIDENCE",
      code: "EVID-PAYM-001",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "qa-01",
      authorRole: "QA_ENGINEER",
      evidenceType: "UNIT_TEST_OUTPUT",
      targetRequirementCode: "REQ-PAYM-001",
      targetTaskId: "task-01",
      rawPayload: {},
      reproducibleCommand: "npm test",
      verifiedPassed: true,
      verifierAgentId: "qa-01",
      verifierModelIdentifier: "gpt-4o",
      verifierSignature: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      dependencies: [],
      tags: [],
      immutable: true,
    };

    const gate: GateDecisionArtifact = {
      id: "gate-01",
      type: "GATE_DECISION",
      code: "GATE-EXEC-001",
      gateType: "EXECUTION_GATE",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "qa-lead",
      authorRole: "QA_ENGINEER",
      status: "PASSED",
      evaluatedRequirements: ["REQ-PAYM-001"],
      attachedEvidenceIds: ["evid-01"],
      violations: [],
      approvedByActorId: "qa-lead",
      approvedByActorType: "SYSTEM_EVALUATOR",
      justification: "All tests verified",
      dependencies: [],
      tags: [],
      immutable: true,
    };

    const markdown = syncer.generatePRDescription({
      title: "feat(billing): Idempotent Charge Implementation",
      branchName: "feat/task-db-charges",
      baseBranch: "main",
      tasks: [],
      requirements: [req],
      adrs: [],
      evidenceList: [evidence],
      gateDecisions: [gate],
    });

    expect(markdown).toContain("Governed Requirements");
    expect(markdown).toContain("REQ-PAYM-001");
    expect(markdown).toContain("EVID-PAYM-001");
    expect(markdown).toContain("e3b0c44298fc1c14...");
    expect(markdown).toContain("GATE-EXEC-001");
    expect(markdown).toContain("🟢 PASSED");
  });
});
