/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 5: Verification Gate Evaluator
 */

import { DiscrepancyReport, SecurityScanResult, MutationReport, FlakinessReport } from "../verification/types.js";
import { GateDecisionArtifact } from "../core/artifacts.js";
import { ArtifactStore } from "../storage/artifact-store.js";
import { EventBus } from "../storage/event-bus.js";
import { Actor } from "../core/types.js";

export class VerificationGateEvaluator {
  constructor(
    private artifactStore: ArtifactStore,
    private eventBus: EventBus
  ) {}

  public async evaluateVerificationReadiness(params: {
    gateId: string;
    targetRequirementCodes: string[];
    claimDiscrepancyReport: DiscrepancyReport;
    securityScanResult: SecurityScanResult;
    mutationReport: MutationReport;
    flakinessReport: FlakinessReport;
    evaluatorActor: Actor;
    justification: string;
  }): Promise<GateDecisionArtifact> {
    const violations: string[] = [];

    // 1. Claim vs Proof Reconciliation Check
    if (!params.claimDiscrepancyReport.allClaimsProven) {
      violations.push(
        `${params.claimDiscrepancyReport.unprovenClaims} claim(s) lack valid cryptographic proof in the Claim-vs-Proof ledger.`
      );
    }

    // 2. Security Audit Check
    if (!params.securityScanResult.passed) {
      const criticals = params.securityScanResult.vulnerabilities.filter(
        (v) => v.severity === "CRITICAL" || v.severity === "HIGH"
      );
      violations.push(`Security Scan failed with ${criticals.length} high/critical finding(s).`);
    }

    // 3. Mutation Testing Score Check (Target >= 80%)
    if (!params.mutationReport.isAcceptable) {
      violations.push(
        `Mutation testing score ${(params.mutationReport.mutationScore * 100).toFixed(0)}% is below quality threshold (80%). Test suite does not sufficiently catch synthetic bugs.`
      );
    }

    // 4. Test Stability & Flakiness Check
    if (params.flakinessReport.suiteStabilityScore < 0.8) {
      violations.push(
        `Test suite stability score ${(params.flakinessReport.suiteStabilityScore * 100).toFixed(0)}% is below 80%. Detected ${params.flakinessReport.flakyTestsDetected} flaky test(s).`
      );
    }

    const passed = violations.length === 0;
    const gateDecision: GateDecisionArtifact = {
      id: params.gateId,
      type: "GATE_DECISION",
      code: `GATE-VERIF-${Date.now().toString().slice(-4)}`,
      gateType: "EXECUTION_GATE",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: params.evaluatorActor.id,
      authorRole: params.evaluatorActor.role,
      status: passed ? "PASSED" : "BLOCKED",
      evaluatedRequirements: params.targetRequirementCodes,
      attachedEvidenceIds: [],
      violations,
      approvedByActorId: params.evaluatorActor.id,
      approvedByActorType: params.evaluatorActor.type === "HUMAN" ? "HUMAN" : "SYSTEM_EVALUATOR",
      justification: params.justification,
      dependencies: [],
      tags: ["verification-gate", "evidence-network"],
      immutable: true,
    };

    await this.artifactStore.put(gateDecision);

    await this.eventBus.publish({
      id: `evt-verif-gate-${Date.now()}`,
      type: passed ? "GATE_PASSED" : "GATE_BLOCKED",
      actorId: params.evaluatorActor.id,
      actorRole: params.evaluatorActor.role,
      payload: {
        gateId: gateDecision.id,
        gateType: "VERIFICATION_GATE",
        status: gateDecision.status,
        evaluatedRequirements: params.targetRequirementCodes,
        violations,
      },
    });

    return gateDecision;
  }
}
