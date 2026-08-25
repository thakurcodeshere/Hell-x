/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Gate Evaluator & Release Promotion Controller
 */

import { ArtifactStore } from "../storage/artifact-store.js";
import { EventBus } from "../storage/event-bus.js";
import { PolicyEngine } from "./policy-engine.js";
import {
  EvidenceArtifact,
  GateDecisionArtifact,
  RequirementArtifact,
  TaskNodeArtifact,
} from "../core/artifacts.js";
import { Actor } from "../core/types.js";

export class GateEvaluator {
  constructor(
    private artifactStore: ArtifactStore,
    private eventBus: EventBus,
    private policyEngine: PolicyEngine = new PolicyEngine()
  ) {}

  public async evaluateReleaseGate(params: {
    gateId: string;
    requirementCode: string;
    evaluatorActor: Actor;
    justification: string;
  }): Promise<GateDecisionArtifact> {
    const req = this.artifactStore.getByCode(params.requirementCode) as RequirementArtifact;
    if (!req) {
      throw new Error(`Requirement with code ${params.requirementCode} not found.`);
    }

    const tasks = this.artifactStore
      .getByType<TaskNodeArtifact>("TASK_NODE")
      .filter((t) => t.targetRequirementCode === params.requirementCode);

    const evidenceList = this.artifactStore.getEvidenceForRequirement(
      params.requirementCode
    ) as EvidenceArtifact[];

    const allViolations: string[] = [];

    // 1. Requirement completeness
    const reqCheck = this.policyEngine.validateRequirementCompleteness(req);
    if (!reqCheck.passed) {
      allViolations.push(...reqCheck.violations);
    }

    // 2. Task-level evidence check
    for (const task of tasks) {
      const taskEvidence = evidenceList.filter((e) => e.targetTaskId === task.id);
      const evidenceCheck = this.policyEngine.validateEvidenceSufficiency(req, task, taskEvidence);
      if (!evidenceCheck.passed) {
        allViolations.push(...evidenceCheck.violations);
      }
    }

    const passed = allViolations.length === 0;
    const gateDecision: GateDecisionArtifact = {
      id: params.gateId,
      type: "GATE_DECISION",
      code: `GATE-${params.requirementCode.replace("REQ-", "")}-${Date.now().toString().slice(-4)}`,
      gateType: "RELEASE_GATE",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: params.evaluatorActor.id,
      authorRole: params.evaluatorActor.role,
      status: passed ? "PASSED" : "BLOCKED",
      evaluatedRequirements: [params.requirementCode],
      attachedEvidenceIds: evidenceList.map((e) => e.id),
      violations: allViolations,
      approvedByActorId: params.evaluatorActor.id,
      approvedByActorType: params.evaluatorActor.type === "HUMAN" ? "HUMAN" : "SYSTEM_EVALUATOR",
      justification: params.justification,
      dependencies: [req.id, ...tasks.map((t) => t.id)],
      tags: ["release-gate", params.requirementCode],
      immutable: true,
    };

    await this.artifactStore.put(gateDecision);

    await this.eventBus.publish({
      id: `evt-${Date.now()}`,
      type: passed ? "GATE_PASSED" : "GATE_BLOCKED",
      actorId: params.evaluatorActor.id,
      actorRole: params.evaluatorActor.role,
      payload: {
        gateId: gateDecision.id,
        requirementCode: params.requirementCode,
        status: gateDecision.status,
        violations: allViolations,
      },
    });

    return gateDecision;
  }
}
