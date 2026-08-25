import { describe, it, expect } from "vitest";
import { ArtifactStore } from "../src/storage/artifact-store.js";
import { RequirementArtifact, EvidenceArtifact } from "../src/core/artifacts.js";
import { HellxError } from "../core/errors.js";

describe("ArtifactStore", () => {
  it("stores, hashes, and indexes artifacts by code and type", async () => {
    const store = new ArtifactStore();
    await store.initialize();

    const req: RequirementArtifact = {
      id: "req-101",
      type: "REQUIREMENT",
      code: "REQ-DB-001",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "pm-1",
      authorRole: "PRODUCT_MANAGER",
      title: "PostgreSQL Database Schema",
      objective: "Define primary user tables",
      actor: "System",
      trigger: "Migration",
      preconditions: [],
      workflow: [],
      expectedResult: "Tables created",
      edgeCases: [],
      constraints: [],
      acceptanceCriteria: ["Schema applies cleanly"],
      verificationMethod: "Migration Test",
      riskLevel: "MEDIUM",
      completenessRadar: {
        functional: 0.8,
        ux: 0.5,
        data: 0.95,
        security: 0.8,
        operational: 0.8,
        errorHandling: 0.8,
        compliance: 0.8,
        observability: 0.8,
      },
      explicitUnknowns: [],
      status: "VALIDATED",
      dependencies: [],
      tags: ["database"],
      immutable: true,
    };

    const saved = await store.put(req);
    expect(saved.sha256Hash).toBeDefined();
    expect(store.getByCode("REQ-DB-001")?.id).toBe("req-101");
    expect(store.getByType("REQUIREMENT").length).toBe(1);
  });

  it("links evidence to target requirements accurately", async () => {
    const store = new ArtifactStore();
    await store.initialize();

    const ev: EvidenceArtifact = {
      id: "ev-1",
      type: "EVIDENCE",
      code: "EVID-TEST-001",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "qa-1",
      authorRole: "QA_ENGINEER",
      evidenceType: "UNIT_TEST_OUTPUT",
      targetRequirementCode: "REQ-DB-001",
      targetTaskId: "task-db-001",
      rawPayload: { passed: true },
      reproducibleCommand: "npm test",
      verifiedPassed: true,
      verifierAgentId: "qa-1",
      verifierModelIdentifier: "claude-3-5-sonnet",
      verifierSignature: "sig_valid",
      dependencies: [],
      tags: [],
      immutable: true,
    };

    await store.put(ev);
    const linkedEvidence = store.getEvidenceForRequirement("REQ-DB-001");
    expect(linkedEvidence.length).toBe(1);
    expect(linkedEvidence[0].id).toBe("ev-1");
  });
});
