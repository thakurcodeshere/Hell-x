/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 6: Release Gate Evaluator
 */

import { DeploymentPlan } from "../release/types.js";
import { GateDecisionArtifact } from "../core/artifacts.js";
import { ArtifactStore } from "../storage/artifact-store.js";
import { EventBus } from "../storage/event-bus.js";
import { Actor } from "../core/types.js";

export class ReleaseGateEvaluator {
  constructor(
    private artifactStore: ArtifactStore,
    private eventBus: EventBus
  ) {}

  public async evaluateReleaseReadiness(params: {
    gateId: string;
    deploymentPlan: DeploymentPlan;
    attachedEvidenceIds: string[];
    evaluatorActor: Actor;
    justification: string;
  }): Promise<GateDecisionArtifact> {
    const violations: string[] = [];

    // 1. Evidence sufficiency check
    if (params.attachedEvidenceIds.length === 0) {
      violations.push("Zero evidence artifacts attached to release candidate. Deployments require verified proof.");
    }

    // 2. Rollback plan check
    if (!params.deploymentPlan.rollbackPlan || !params.deploymentPlan.rollbackPlan.previousStableCommitHash) {
      violations.push("Rollback plan is missing a previous stable commit reference.");
    }

    // 3. SLO Thresholds defined check
    if (params.deploymentPlan.sloThresholds.maxErrorRate <= 0) {
      violations.push("SLO maxErrorRate threshold is invalid or missing.");
    }

    const passed = violations.length === 0;
    const gateDecision: GateDecisionArtifact = {
      id: params.gateId,
      type: "GATE_DECISION",
      code: `GATE-REL-${Date.now().toString().slice(-4)}`,
      gateType: "RELEASE_GATE",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: params.evaluatorActor.id,
      authorRole: params.evaluatorActor.role,
      status: passed ? "PASSED" : "BLOCKED",
      evaluatedRequirements: [params.deploymentPlan.releaseVersion],
      attachedEvidenceIds: params.attachedEvidenceIds,
      violations,
      approvedByActorId: params.evaluatorActor.id,
      approvedByActorType: params.evaluatorActor.type === "HUMAN" ? "HUMAN" : "SYSTEM_EVALUATOR",
      justification: params.justification,
      dependencies: [],
      tags: ["release-gate", params.deploymentPlan.strategy.toLowerCase()],
      immutable: true,
    };

    await this.artifactStore.put(gateDecision);

    await this.eventBus.publish({
      id: `evt-rel-gate-${Date.now()}`,
      type: passed ? "GATE_PASSED" : "GATE_BLOCKED",
      actorId: params.evaluatorActor.id,
      actorRole: params.evaluatorActor.role,
      payload: {
        gateId: gateDecision.id,
        gateType: "RELEASE_GATE",
        status: gateDecision.status,
        version: params.deploymentPlan.releaseVersion,
        violations,
      },
    });

    return gateDecision;
  }
}
