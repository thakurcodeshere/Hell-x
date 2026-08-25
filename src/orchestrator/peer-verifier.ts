/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Peer Verifier & Independent Review Engine (Primary Principle Enforcement)
 */

import { OrchestratorTask } from "./types.js";
import { EvidenceArtifact } from "../core/artifacts.js";
import { ArtifactStore } from "../storage/artifact-store.js";
import { EventBus } from "../storage/event-bus.js";
import { SelfReviewViolationError, HellxError } from "../core/errors.js";
import { Role } from "../core/types.js";
import crypto from "crypto";

export class PeerVerifier {
  constructor(
    private artifactStore?: ArtifactStore,
    private eventBus?: EventBus
  ) {}

  /**
   * Independently reviews a worker submission and produces cryptographic proof
   */
  public async verifySubmission(params: {
    task: OrchestratorTask;
    verifierId: string;
    verifierRole: Role;
    testSuccess: boolean;
    securityPassed: boolean;
    reviewNotes: string;
  }): Promise<EvidenceArtifact> {
    if (!params.task.submission) {
      throw new HellxError(`Task '${params.task.id}' has no active submission to verify.`, "NO_SUBMISSION");
    }

    // PRIMARY PRINCIPLE ENFORCEMENT:
    // "NO AGENT IS THE SOLE AUTHORITY OVER ITS OWN OUTPUT."
    if (params.verifierId === params.task.submission.workerId) {
      throw new SelfReviewViolationError(
        params.task.submission.workerId,
        params.verifierId,
        params.task.id
      );
    }

    const passed = params.testSuccess && params.securityPassed;
    const evidencePayload = JSON.stringify({
      taskId: params.task.id,
      taskCode: params.task.code,
      workerId: params.task.submission.workerId,
      commitHash: params.task.submission.gitCommitHash,
      changedFiles: params.task.submission.changedFiles,
      testSuccess: params.testSuccess,
      securityPassed: params.securityPassed,
      reviewNotes: params.reviewNotes,
      verifiedAt: new Date().toISOString(),
    });

    const evidenceHash = crypto.createHash("sha256").update(evidencePayload).digest("hex");
    const evidenceId = `art-evid-${params.task.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const cleanCode = params.task.code.replace(/[^A-Z0-9]/g, "");

    const evidence: EvidenceArtifact = {
      id: evidenceId,
      type: "EVIDENCE",
      code: `EVID-${cleanCode}-001`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: params.verifierId,
      authorRole: params.verifierRole,
      evidenceType: "UNIT_TEST_OUTPUT",
      targetRequirementCode: "REQ-PAYM-001",
      targetTaskId: params.task.id,
      rawPayload: {
        testsPassed: params.testSuccess,
        securityPassed: params.securityPassed,
        reviewNotes: params.reviewNotes,
      },
      reproducibleCommand: "npm test",
      verifiedPassed: passed,
      verifierAgentId: params.verifierId,
      verifierModelIdentifier: "gpt-4o",
      verifierSignature: evidenceHash,
      dependencies: [],
      tags: ["peer-verification", params.task.code.toLowerCase()],
      immutable: true,
    };

    if (this.artifactStore) {
      await this.artifactStore.put(evidence);
    }

    // Update task state
    params.task.status = passed ? "VERIFIED" : "FAILED";
    params.task.verification = {
      taskId: params.task.id,
      verifierId: params.verifierId,
      verifierRole: params.verifierRole,
      status: passed ? "PASSED" : "REJECTED",
      testsPassed: params.testSuccess,
      securityAuditPassed: params.securityPassed,
      evidenceId,
      evidenceHash,
      reviewNotes: params.reviewNotes,
      verifiedAt: new Date().toISOString(),
    };
    params.task.updatedAt = new Date().toISOString();

    if (this.eventBus) {
      await this.eventBus.publish({
        id: `evt-verified-${params.task.id}-${Date.now()}`,
        type: passed ? "EVIDENCE_SUBMITTED" : "GATE_BLOCKED",
        actorId: params.verifierId,
        actorRole: params.verifierRole,
        payload: {
          taskId: params.task.id,
          taskCode: params.task.code,
          evidenceId,
          evidenceHash,
          status: passed ? "PASSED" : "FAILED",
        },
      });
    }

    return evidence;
  }
}
