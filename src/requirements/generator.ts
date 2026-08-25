/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Requirement Decomposer & Specification Generator
 */

import { ExtractedIntentVector } from "../intent/types.js";
import { RequirementArtifact } from "../core/artifacts.js";
import { CompletenessEngine } from "./completeness.js";
import { UnknownsEngine } from "./unknowns-engine.js";

export class RequirementGenerator {
  private completenessEngine: CompletenessEngine;

  constructor(private unknownsEngine?: UnknownsEngine) {
    this.completenessEngine = new CompletenessEngine();
  }

  /**
   * Generates structured requirements from extracted intent vector
   */
  public generateRequirements(
    intent: ExtractedIntentVector,
    options?: { authorId?: string; idSuffix?: string }
  ): RequirementArtifact[] {
    const requirements: RequirementArtifact[] = [];
    const domainPrefix = intent.targetDomain.substring(0, 4).toUpperCase();
    const suffix = options?.idSuffix ? `-${options.idSuffix}` : "";
    const authorId = options?.authorId || "agent-product-manager-01";

    // 1. Primary Functional Requirement
    const req1Code = `REQ-${domainPrefix}-001${suffix}`;
    const req1Draft: RequirementArtifact = {
      id: `art-req-${domainPrefix.toLowerCase()}-001${suffix}`,
      type: "REQUIREMENT",
      code: req1Code,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId,
      authorRole: "PRODUCT_MANAGER",
      title: `${intent.targetDomain} Primary Core Workflow`,
      objective: intent.problemStatement,
      actor: intent.actors.find((a) => a.isPrimary)?.name || "Primary User",
      trigger: `User initiates ${intent.targetDomain.toLowerCase()} request`,
      preconditions: ["System is operational", "User has valid permissions"],
      workflow: [
        "Validate incoming request payload",
        "Process business rules and persist state",
        "Return structured outcome to caller",
      ],
      expectedResult: "Operation completes successfully with verifiable state change.",
      edgeCases: [
        "Invalid or malformed payload returns validation error",
        "Concurrent conflict returns retryable status",
      ],
      constraints: intent.constraints.map((c) => c.statement),
      acceptanceCriteria: [
        `AC1: ${intent.targetDomain} core workflow completes with success status`,
        `AC2: Edge cases and malformed inputs are handled gracefully`,
      ],
      verificationMethod: "Automated Integration Test Suite + E2E Acceptance Run",
      riskLevel: intent.risks.some((r) => r.severity === "CRITICAL")
        ? "CRITICAL"
        : intent.risks.some((r) => r.severity === "HIGH")
        ? "HIGH"
        : "MEDIUM",
      completenessRadar: {
        functional: 0.9,
        ux: 0.8,
        data: 0.85,
        security: 0.9,
        operational: 0.85,
        errorHandling: 0.85,
        compliance: 0.8,
        observability: 0.85,
      },
      explicitUnknowns: [],
      status: "VALIDATED",
      dependencies: [],
      tags: [intent.targetDomain.toLowerCase(), "core-spec"],
      immutable: true,
    };

    // Calculate actual 10D radar
    const report1 = this.completenessEngine.evaluateCompleteness(req1Draft);
    req1Draft.completenessRadar = {
      functional: report1.radar.functional,
      ux: report1.radar.ux,
      data: report1.radar.data,
      security: report1.radar.security,
      operational: report1.radar.operational,
      errorHandling: report1.radar.errorHandling,
      compliance: report1.radar.compliance,
      observability: report1.radar.observability,
    };

    requirements.push(req1Draft);

    // If intent has data retention or security constraints, generate dedicated security/audit requirement
    if (intent.targetDomain === "PAYMENT" || intent.targetDomain === "AUTH" || intent.rawInput.toLowerCase().includes("audit")) {
      const req2Code = `REQ-${domainPrefix}-002${suffix}`;
      const req2Draft: RequirementArtifact = {
        id: `art-req-${domainPrefix.toLowerCase()}-002${suffix}`,
        type: "REQUIREMENT",
        code: req2Code,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authorId,
        authorRole: "PRODUCT_MANAGER",
        title: `${intent.targetDomain} Audit Trail & Data Integrity`,
        objective: `Maintain immutable financial and compliance audit records for all ${intent.targetDomain.toLowerCase()} events.`,
        actor: "System Audit Logger",
        trigger: "Any state mutation in domain",
        preconditions: ["Audit store is connected and writable"],
        workflow: [
          "Capture immutable event with actor identity and timestamp",
          "Compute cryptographic SHA-256 event hash",
          "Append to tamper-evident audit ledger",
        ],
        expectedResult: "Audit entry recorded with verifiable signature.",
        edgeCases: ["Ledger write failure halts mutation to prevent un-audited state change"],
        constraints: ["Audit logs must be retained for 7 years and cannot be deleted"],
        acceptanceCriteria: [
          "AC1: Every transaction writes an immutable audit record",
          "AC2: Audit records cannot be purged by standard user deletion requests",
        ],
        verificationMethod: "Cryptographic Tamper-Evidence Test Suite",
        riskLevel: "HIGH",
        completenessRadar: {
          functional: 0.95,
          ux: 0.7,
          data: 0.95,
          security: 0.95,
          operational: 0.9,
          errorHandling: 0.9,
          compliance: 0.95,
          observability: 0.95,
        },
        explicitUnknowns: [],
        status: "VALIDATED",
        dependencies: [req1Draft.id],
        tags: [intent.targetDomain.toLowerCase(), "audit", "security"],
        immutable: true,
      };

      const report2 = this.completenessEngine.evaluateCompleteness(req2Draft);
      req2Draft.completenessRadar = {
        functional: report2.radar.functional,
        ux: report2.radar.ux,
        data: report2.radar.data,
        security: report2.radar.security,
        operational: report2.radar.operational,
        errorHandling: report2.radar.errorHandling,
        compliance: report2.radar.compliance,
        observability: report2.radar.observability,
      };

      requirements.push(req2Draft);
    }

    return requirements;
  }
}
