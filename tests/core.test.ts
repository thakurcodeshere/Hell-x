import { describe, it, expect } from "vitest";
import { RequirementArtifactSchema, ADRArtifactSchema } from "../src/core/artifacts.js";
import { PolicyEngine } from "../src/governance/policy-engine.js";

describe("Core Domain Models & Risk Engine", () => {
  it("validates a well-formed Requirement Artifact", () => {
    const validReq = {
      id: "req-001",
      type: "REQUIREMENT",
      code: "REQ-PAY-001",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "pm-1",
      authorRole: "PRODUCT_MANAGER",
      title: "Stripe Payment Gateway Integration",
      objective: "Allow customers to pay via credit card using Stripe.",
      actor: "Customer",
      trigger: "Checkout button clicked",
      preconditions: ["Cart is not empty"],
      workflow: ["Collect card token", "Charge customer", "Record invoice"],
      expectedResult: "Charge successful",
      edgeCases: ["Card declined", "Network timeout"],
      constraints: ["PCI-DSS compliant"],
      acceptanceCriteria: ["Charge completes < 2s", "Invoice generated"],
      verificationMethod: "Integration Tests",
      riskLevel: "HIGH",
      completenessRadar: {
        functional: 0.9,
        ux: 0.8,
        data: 0.9,
        security: 0.95,
        operational: 0.85,
        errorHandling: 0.9,
        compliance: 0.95,
        observability: 0.8,
      },
      explicitUnknowns: [],
      status: "VALIDATED",
      dependencies: [],
      tags: ["payment", "stripe"],
      immutable: true,
    };

    const parsed = RequirementArtifactSchema.parse(validReq);
    expect(parsed.code).toBe("REQ-PAY-001");
    expect(parsed.riskLevel).toBe("HIGH");
  });

  it("calculates multi-dimensional risk score accurately", () => {
    const policyEngine = new PolicyEngine();
    const risk = policyEngine.calculateRiskScore({
      businessImpact: 0.8,
      securitySurface: 0.9,
      dataSensitivity: 0.9,
      architecturalBlastRadius: 0.7,
      changeComplexity: 0.6,
      productionExposure: 0.8,
      historicalDefectRate: 0.2,
    });

    expect(risk.score).toBeGreaterThan(0.7);
    expect(risk.level).toBe("CRITICAL");
    expect(risk.requiredProcessDepth).toBe("HIGH_ASSURANCE");
    expect(risk.mandatesHumanApproval).toBe(true);
    expect(risk.mandatesIndependentVerifier).toBe(true);
  });
});
