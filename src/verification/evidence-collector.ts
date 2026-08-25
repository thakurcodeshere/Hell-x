/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Multi-Modal Evidence Collector & Cryptographic Proof Chainer (Section 18)
 */

import { EvidenceArtifact, EvidenceType } from "../core/artifacts.js";
import { ArtifactStore } from "../storage/artifact-store.js";
import { EventBus } from "../storage/event-bus.js";
import { EvidenceBundle } from "./types.js";
import { Role } from "../core/types.js";
import crypto from "crypto";

export class EvidenceCollector {
  constructor(
    private artifactStore?: ArtifactStore,
    private eventBus?: EventBus
  ) {}

  /**
   * Captures and cryptographically seals a specific proof of execution
   */
  public async captureEvidence(params: {
    evidenceType: EvidenceType;
    targetRequirementCode: string;
    targetTaskId: string;
    rawPayload: Record<string, any>;
    reproducibleCommand: string;
    verifiedPassed: boolean;
    verifierId: string;
    verifierRole: Role;
    claimVsProofDiff?: string;
  }): Promise<EvidenceArtifact> {
    const rawString = JSON.stringify({
      type: params.evidenceType,
      req: params.targetRequirementCode,
      task: params.targetTaskId,
      payload: params.rawPayload,
      verifier: params.verifierId,
      timestamp: new Date().toISOString(),
    });

    const signature = crypto.createHash("sha256").update(rawString).digest("hex");
    const codeSuffix = Date.now().toString().slice(-4);
    const cleanReq = params.targetRequirementCode.replace(/[^A-Z0-9]/g, "");

    const evidence: EvidenceArtifact = {
      id: `art-evid-${codeSuffix}`,
      type: "EVIDENCE",
      code: `EVID-${cleanReq}-${codeSuffix}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: params.verifierId,
      authorRole: params.verifierRole,
      evidenceType: params.evidenceType,
      targetRequirementCode: params.targetRequirementCode,
      targetTaskId: params.targetTaskId,
      rawPayload: params.rawPayload,
      reproducibleCommand: params.reproducibleCommand,
      verifiedPassed: params.verifiedPassed,
      verifierAgentId: params.verifierId,
      verifierModelIdentifier: "gpt-4o",
      verifierSignature: signature,
      claimVsProofDiff: params.claimVsProofDiff,
      dependencies: [],
      tags: ["evidence-network", params.evidenceType.toLowerCase()],
      immutable: true,
    };

    if (this.artifactStore) {
      await this.artifactStore.put(evidence);
    }

    if (this.eventBus) {
      await this.eventBus.publish({
        id: `evt-evid-${evidence.id}-${Date.now()}`,
        type: "EVIDENCE_RECORDED",
        actorId: params.verifierId,
        actorRole: params.verifierRole,
        payload: {
          evidenceId: evidence.id,
          code: evidence.code,
          evidenceType: evidence.evidenceType,
          verifiedPassed: evidence.verifiedPassed,
          signature,
        },
      });
    }

    return evidence;
  }

  /**
   * Bundles all collected evidence for a specific task and requirement
   */
  public bundleEvidence(
    requirementCode: string,
    taskId: string,
    commitHash: string,
    evidenceList: EvidenceArtifact[],
    verifierId: string,
    verifierRole: Role
  ): EvidenceBundle {
    return {
      id: `bundle-${taskId}-${Date.now().toString().slice(-4)}`,
      requirementCode,
      taskId,
      commitHash,
      collectedEvidence: evidenceList,
      verifierId,
      verifierRole,
      createdAt: new Date().toISOString(),
    };
  }
}
