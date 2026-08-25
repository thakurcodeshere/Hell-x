/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Dual-Authorization & Multi-Signature Release Gate Evaluator
 */

import { MultiSigApprovalToken } from "./types.js";
import { EvidenceArtifact, GateDecisionArtifact } from "../core/artifacts.js";
import { RBACEngine } from "./rbac-engine.js";
import { ArtifactStore } from "../storage/artifact-store.js";
import { EventBus } from "../storage/event-bus.js";
import { HellxError } from "../core/errors.js";

export interface MultiSigGateParams {
  gateCode: string;
  releaseId: string;
  automatedEvidence: EvidenceArtifact;
  humanApprovalToken: MultiSigApprovalToken;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export class MultiSigGateEvaluator {
  constructor(
    private rbacEngine: RBACEngine,
    private artifactStore: ArtifactStore,
    private eventBus: EventBus
  ) {}

  public async evaluateMultiSigRelease(params: MultiSigGateParams): Promise<GateDecisionArtifact> {
    const violations: string[] = [];

    // 1. Verify Automated Evidence
    if (!params.automatedEvidence.verifiedPassed) {
      violations.push(`Automated proof '${params.automatedEvidence.code}' failed independent verification.`);
    }

    if (!params.automatedEvidence.verifierSignature || params.automatedEvidence.verifierSignature.length < 32) {
      violations.push(`Automated proof '${params.automatedEvidence.code}' missing cryptographic verifier signature.`);
    }

    // 2. Verify Human Lead Dual-Authorization
    if (!params.humanApprovalToken.approverIsHuman) {
      violations.push(`Multi-sig token must be signed by a verified Human lead, but received automated agent token.`);
    }

    const hasReleasePerm = this.rbacEngine.hasPermission(
      params.humanApprovalToken.approverId,
      "GATE_APPROVE_RELEASE"
    );
    if (!hasReleasePerm) {
      violations.push(`Human approver '${params.humanApprovalToken.approverId}' (${params.humanApprovalToken.approverRole}) lacks 'GATE_APPROVE_RELEASE' permission.`);
    }

    if (!params.humanApprovalToken.digitalSignature || params.humanApprovalToken.digitalSignature.length < 16) {
      violations.push(`Human approval token missing valid digital signature.`);
    }

    const isPassed = violations.length === 0;

    const gateDecision: GateDecisionArtifact = {
      id: `gate-multisig-${Date.now()}`,
      type: "GATE_DECISION",
      code: params.gateCode,
      gateType: "RELEASE_GATE",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: params.humanApprovalToken.approverId,
      authorRole: "SYSTEM_ARCHITECT",
      status: isPassed ? "PASSED" : "BLOCKED",
      evaluatedRequirements: [params.automatedEvidence.targetRequirementCode],
      attachedEvidenceIds: [params.automatedEvidence.id],
      violations,
      approvedByActorId: params.humanApprovalToken.approverId,
      approvedByActorType: "HUMAN",
      justification: isPassed
        ? `Dual-authorization verified: Automated proof '${params.automatedEvidence.code}' and Human lead token '${params.humanApprovalToken.approverId}'.`
        : `Multi-sig authorization blocked due to violations: ${violations.join(" | ")}`,
      dependencies: [params.automatedEvidence.id],
      tags: ["multisig", "dual-authorization", "enterprise"],
      immutable: true,
    };

    await this.artifactStore.put(gateDecision);

    await this.eventBus.publish({
      id: `evt-multisig-${Date.now()}`,
      type: isPassed ? "GATE_PASSED" : "GATE_BLOCKED",
      actorId: params.humanApprovalToken.approverId,
      actorRole: "SYSTEM_ARCHITECT",
      payload: {
        gateCode: gateDecision.code,
        status: gateDecision.status,
        violations: gateDecision.violations,
        approver: params.humanApprovalToken.approverId,
      },
    });

    return gateDecision;
  }
}
