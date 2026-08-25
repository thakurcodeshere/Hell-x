import { describe, it, expect } from "vitest";
import { AttestationSigner } from "../src/attestation/attestation-signer.js";
import { EvidenceArtifact } from "../src/core/artifacts.js";

describe("AttestationSigner (Milestone 11)", () => {
  const signer = new AttestationSigner();

  it("signs and verifies payload signatures", () => {
    const payload = { commit: "abc1234", buildStatus: "SUCCESS" };
    const sig = signer.signPayload(payload);
    expect(sig).toBeDefined();
    expect(typeof sig).toBe("string");

    const valid = signer.verifySignature(payload, sig);
    expect(valid).toBe(true);

    const tampered = signer.verifySignature({ ...payload, buildStatus: "FAILED" }, sig);
    expect(tampered).toBe(false);
  });

  it("attests evidence artifact with cryptographic hash and signature", () => {
    const evidence: EvidenceArtifact = {
      id: "evid-01",
      type: "EVIDENCE",
      code: "EVID-TEST-001",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "qa-01",
      authorRole: "QA_ENGINEER",
      evidenceType: "UNIT_TEST_OUTPUT",
      targetRequirementCode: "REQ-PAYM-001",
      targetTaskId: "task-01",
      rawPayload: { passed: true },
      reproducibleCommand: "npm test",
      verifiedPassed: true,
      verifierAgentId: "qa-01",
      verifierModelIdentifier: "gpt-4o",
      verifierSignature: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      dependencies: [],
      tags: [],
      immutable: true,
    };

    const attestation = signer.attestEvidence(evidence);
    expect(attestation.signature).toBeDefined();
    expect(attestation.keyId).toBe(signer.getKeyId());
    expect(attestation.sha256Digest.length).toBe(64);
  });
});
