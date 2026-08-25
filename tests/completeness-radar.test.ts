import { describe, it, expect } from "vitest";
import { CompletenessEngine } from "../src/requirements/completeness.js";
import { RequirementArtifact } from "../src/core/artifacts.js";

describe("CompletenessEngine (Layer 02)", () => {
  const engine = new CompletenessEngine();

  it("calculates 10D radar and flags missing dimensions", () => {
    const sparseReq: RequirementArtifact = {
      id: "req-sparse-01",
      type: "REQUIREMENT",
      code: "REQ-UX-001",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "pm",
      authorRole: "PRODUCT_MANAGER",
      title: "Simple button",
      objective: "Click button",
      actor: "User",
      trigger: "Click",
      preconditions: [],
      workflow: ["Click"],
      expectedResult: "Clicked",
      edgeCases: [], // Missing edge cases
      constraints: [], // Missing constraints
      acceptanceCriteria: ["Works"],
      verificationMethod: "Manual",
      riskLevel: "LOW",
      completenessRadar: {
        functional: 0.5,
        ux: 0.5,
        data: 0.5,
        security: 0.5,
        operational: 0.5,
        errorHandling: 0.5,
        compliance: 0.5,
        observability: 0.5,
      },
      explicitUnknowns: [],
      status: "DRAFT",
      dependencies: [],
      tags: [],
      immutable: true,
    };

    const report = engine.evaluateCompleteness(sparseReq);
    expect(report.isReadyForArchitecture).toBe(false);
    expect(report.missingDimensions.length).toBeGreaterThan(0);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });
});
