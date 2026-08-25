import { describe, it, expect } from "vitest";
import { ConflictDetector } from "../src/requirements/conflict-detector.js";
import { RequirementArtifact } from "../src/core/artifacts.js";

describe("ConflictDetector (Layer 02)", () => {
  const detector = new ConflictDetector();

  it("detects conflict between user account deletion and immutable audit retention", () => {
    const reqDelete: RequirementArtifact = {
      id: "req-del-01",
      type: "REQUIREMENT",
      code: "REQ-AUTH-001",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "pm",
      authorRole: "PRODUCT_MANAGER",
      title: "User Account Erasure",
      objective: "Users can delete their account and purge all personal records completely.",
      actor: "User",
      trigger: "Delete button clicked",
      preconditions: [],
      workflow: ["Purge all tables"],
      expectedResult: "User records erased",
      edgeCases: [],
      constraints: ["Purge all tables completely"],
      acceptanceCriteria: ["Account deleted"],
      verificationMethod: "Integration Test",
      riskLevel: "HIGH",
      completenessRadar: {
        functional: 0.8,
        ux: 0.8,
        data: 0.8,
        security: 0.8,
        operational: 0.8,
        errorHandling: 0.8,
        compliance: 0.8,
        observability: 0.8,
      },
      explicitUnknowns: [],
      status: "VALIDATED",
      dependencies: [],
      tags: [],
      immutable: true,
    };

    const reqAudit: RequirementArtifact = {
      id: "req-audit-01",
      type: "REQUIREMENT",
      code: "REQ-FIN-002",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "pm",
      authorRole: "PRODUCT_MANAGER",
      title: "Financial Ledger Invariants",
      objective: "Financial transaction records and invoices cannot be deleted and must remain immutable for 7 years.",
      actor: "Auditor",
      trigger: "Audit check",
      preconditions: [],
      workflow: ["Verify ledger immutability"],
      expectedResult: "Audit records preserved",
      edgeCases: [],
      constraints: ["Immutable records cannot be deleted"],
      acceptanceCriteria: ["Audit trail preserved"],
      verificationMethod: "Tamper Test",
      riskLevel: "HIGH",
      completenessRadar: {
        functional: 0.8,
        ux: 0.8,
        data: 0.8,
        security: 0.8,
        operational: 0.8,
        errorHandling: 0.8,
        compliance: 0.8,
        observability: 0.8,
      },
      explicitUnknowns: [],
      status: "VALIDATED",
      dependencies: [],
      tags: [],
      immutable: true,
    };

    const conflicts = detector.detectConflicts([reqDelete, reqAudit]);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].type).toBe("DATA_RETENTION_VS_DELETION");
    expect(conflicts[0].severity).toBe("CRITICAL");
  });
});
