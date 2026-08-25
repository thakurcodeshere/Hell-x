import { describe, it, expect } from "vitest";
import { PolicyEngine } from "../src/governance/policy-engine.js";
import { SelfReviewViolationError } from "../src/core/errors.js";
import { RequirementArtifact, TaskNodeArtifact, EvidenceArtifact } from "../src/core/artifacts.js";

describe("Governance & Primary Principle (Claim != Proof)", () => {
  const policyEngine = new PolicyEngine();

  it("strictly prohibits self-review (Primary Principle)", () => {
    expect(() => {
      policyEngine.validateIndependentVerification(
        "builder-agent-01",
        "builder-agent-01", // Attempted self-review
        "req-auth-001"
      );
    }).toThrow(SelfReviewViolationError);
  });

  it("permits independent verification when builder and verifier differ", () => {
    expect(() => {
      policyEngine.validateIndependentVerification(
        "builder-agent-01",
        "qa-agent-02",
        "req-auth-001"
      );
    }).not.toThrow();
  });

  it("rejects evidence bundle if mandatory proof types are missing", () => {
    const req: RequirementArtifact = {
      id: "req-1",
      type: "REQUIREMENT",
      code: "REQ-1",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "pm",
      authorRole: "PRODUCT_MANAGER",
      title: "Test",
      objective: "Test",
      actor: "Test",
      trigger: "Test",
      preconditions: [],
      workflow: [],
      expectedResult: "Test",
      edgeCases: [],
      constraints: [],
      acceptanceCriteria: [],
      verificationMethod: "Test",
      riskLevel: "MEDIUM",
      completenessRadar: {
        functional: 0.9,
        ux: 0.9,
        data: 0.9,
        security: 0.9,
        operational: 0.9,
        errorHandling: 0.9,
        compliance: 0.9,
        observability: 0.9,
      },
      explicitUnknowns: [],
      status: "VALIDATED",
      dependencies: [],
      tags: [],
      immutable: true,
    };

    const task: TaskNodeArtifact = {
      id: "task-1",
      type: "TASK_NODE",
      code: "TASK-1",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "builder-1",
      authorRole: "BACKEND_ENGINEER",
      title: "Test",
      description: "Test",
      assignedRole: "BACKEND_ENGINEER",
      assignedModelTier: "TIER_FAST_LOW_COST",
      targetRequirementCode: "REQ-1",
      isolationBranch: "b1",
      status: "RUNNING",
      executionProofRequired: ["UNIT_TEST_OUTPUT", "SECURITY_SCAN_REPORT"],
      retryCount: 0,
      costUsd: 0,
      dependencies: [],
      tags: [],
      immutable: false,
    };

    // Only unit test provided, missing security scan
    const evidenceList: EvidenceArtifact[] = [
      {
        id: "ev-1",
        type: "EVIDENCE",
        code: "EVID-1",
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authorId: "qa-1",
        authorRole: "QA_ENGINEER",
        evidenceType: "UNIT_TEST_OUTPUT",
        targetRequirementCode: "REQ-1",
        targetTaskId: "task-1",
        rawPayload: {},
        reproducibleCommand: "npm test",
        verifiedPassed: true,
        verifierAgentId: "qa-1",
        verifierModelIdentifier: "claude",
        verifierSignature: "sig",
        dependencies: [],
        tags: [],
        immutable: true,
      },
    ];

    const result = policyEngine.validateEvidenceSufficiency(req, task, evidenceList);
    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.includes("SECURITY_SCAN_REPORT"))).toBe(true);
  });
});
