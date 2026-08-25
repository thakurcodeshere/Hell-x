import { describe, it, expect } from "vitest";
import { DomainModeler } from "../src/blueprint/domain-modeler.js";
import { RequirementArtifact } from "../src/core/artifacts.js";

describe("DomainModeler (Layer 03)", () => {
  const modeler = new DomainModeler();

  it("derives domain entities, fields, and invariants from requirements", () => {
    const req: RequirementArtifact = {
      id: "req-pay-01",
      type: "REQUIREMENT",
      code: "REQ-PAYM-001",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "pm",
      authorRole: "PRODUCT_MANAGER",
      title: "Payment Processing Workflow",
      objective: "Process customer payment transactions and generate immutable tax invoices.",
      actor: "Customer",
      trigger: "Pay button",
      preconditions: [],
      workflow: ["Charge credit card", "Create invoice"],
      expectedResult: "Payment completed",
      edgeCases: [],
      constraints: [],
      acceptanceCriteria: [],
      verificationMethod: "Test",
      riskLevel: "HIGH",
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
      tags: ["payment"],
      immutable: true,
    };

    const result = modeler.modelDomain([req]);
    expect(result.boundedContexts).toContain("PAYMENT");
    expect(result.entities.some((e) => e.name === "PaymentTransaction")).toBe(true);
    expect(result.entities.some((e) => e.name === "Invoice")).toBe(true);

    const invoiceEntity = result.entities.find((e) => e.name === "Invoice")!;
    expect(invoiceEntity.traceRequirementCodes).toContain("REQ-PAYM-001");
    expect(invoiceEntity.fields.some((f) => f.name === "auditLedgerHash")).toBe(true);
  });
});
