import { describe, it, expect } from "vitest";
import { ClaimProofLedger } from "../src/verification/claim-proof-ledger.js";
import { EvidenceArtifact } from "../src/core/artifacts.js";

describe("ClaimProofLedger (Phase 5 / Section 19)", () => {
  it("reconciles claims against independent evidence and flags discrepancies", () => {
    const ledger = new ClaimProofLedger();

    ledger.registerClaim({
      id: "claim-1",
      statement: "Implemented and verified JWT token generation",
      authorId: "agent-backend-01",
      authorRole: "BACKEND_SPECIALIST",
      targetRequirementCode: "REQ-AUTH-001",
      targetTaskId: "task-01",
    });

    const reportBefore = ledger.auditClaims();
    expect(reportBefore.allClaimsProven).toBe(false);
    expect(reportBefore.unprovenClaims).toBe(1);

    const validEvidence: EvidenceArtifact = {
      id: "evid-1",
      type: "EVIDENCE",
      code: "EVID-AUTH-001",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "agent-qa-01",
      authorRole: "QA_ENGINEER",
      evidenceType: "UNIT_TEST_OUTPUT",
      targetRequirementCode: "REQ-AUTH-001",
      targetTaskId: "task-01",
      rawPayload: {},
      reproducibleCommand: "npm test",
      verifiedPassed: true,
      verifierAgentId: "agent-qa-01",
      verifierModelIdentifier: "gpt-4o",
      verifierSignature: "abc123hash",
      dependencies: [],
      tags: [],
      immutable: true,
    };

    ledger.attachProof("claim-1", validEvidence);

    const reportAfter = ledger.auditClaims();
    expect(reportAfter.allClaimsProven).toBe(true);
    expect(reportAfter.provenClaims).toBe(1);
    expect(reportAfter.unprovenClaims).toBe(0);
  });
});
