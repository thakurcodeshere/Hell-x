/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 1: Specification Gate Evaluator
 */

import { RequirementArtifact, GateDecisionArtifact } from "../core/artifacts.js";
import { ArtifactStore } from "../storage/artifact-store.js";
import { EventBus } from "../storage/event-bus.js";
import { ConflictDetector } from "../requirements/conflict-detector.js";
import { CompletenessEngine } from "../requirements/completeness.js";
import { UnknownsEngine } from "../requirements/unknowns-engine.js";
import { Actor } from "../core/types.js";

export class SpecificationGateEvaluator {
  private conflictDetector: ConflictDetector;
  private completenessEngine: CompletenessEngine;

  constructor(
    private artifactStore: ArtifactStore,
    private eventBus: EventBus,
    private unknownsEngine?: UnknownsEngine,
    conflictDetector?: ConflictDetector
  ) {
    this.conflictDetector = conflictDetector || new ConflictDetector();
    this.completenessEngine = new CompletenessEngine();
  }

  public async evaluateSpecificationReadiness(params: {
    gateId: string;
    requirementCodes: string[];
    evaluatorActor: Actor;
    justification: string;
  }): Promise<GateDecisionArtifact> {
    const requirements: RequirementArtifact[] = [];
    const allViolations: string[] = [];

    for (const code of params.requirementCodes) {
      const req = this.artifactStore.getByCode(code) as RequirementArtifact;
      if (!req) {
        allViolations.push(`Requirement '${code}' not found in artifact store.`);
      } else {
        requirements.push(req);
      }
    }

    // 1. Check completeness scores
    for (const req of requirements) {
      const report = this.completenessEngine.evaluateCompleteness(req);
      if (!report.isReadyForArchitecture) {
        allViolations.push(
          `Requirement ${req.code} has completeness score ${(report.overallScore * 100).toFixed(0)}% (threshold >= 75%). Missing: [${report.missingDimensions.join(", ")}]`
        );
      }
    }

    // 2. Check for cross-requirement conflicts
    const conflicts = this.conflictDetector.detectConflicts(requirements);
    const unresolvedConflicts = conflicts.filter((c) => !c.resolved);
    for (const conflict of unresolvedConflicts) {
      allViolations.push(
        `Unresolved [${conflict.type}] between ${conflict.requirementACode} and ${conflict.requirementBCode}: ${conflict.explanation}`
      );
    }

    // 3. Check for open blocking unknowns
    if (this.unknownsEngine) {
      const openUnknowns = this.unknownsEngine.getOpenUnknowns();
      const blocking = openUnknowns.filter((u) =>
        u.impactOnRequirements.some((r) => params.requirementCodes.includes(r))
      );
      for (const unk of blocking) {
        allViolations.push(
          `Blocking open unknown ${unk.code} (${unk.category}): ${unk.question}`
        );
      }
    }

    const passed = allViolations.length === 0;
    const gateDecision: GateDecisionArtifact = {
      id: params.gateId,
      type: "GATE_DECISION",
      code: `GATE-SPEC-${Date.now().toString().slice(-4)}`,
      gateType: "SPECIFICATION_GATE",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: params.evaluatorActor.id,
      authorRole: params.evaluatorActor.role,
      status: passed ? "PASSED" : "BLOCKED",
      evaluatedRequirements: params.requirementCodes,
      attachedEvidenceIds: [],
      violations: allViolations,
      approvedByActorId: params.evaluatorActor.id,
      approvedByActorType: params.evaluatorActor.type === "HUMAN" ? "HUMAN" : "SYSTEM_EVALUATOR",
      justification: params.justification,
      dependencies: requirements.map((r) => r.id),
      tags: ["specification-gate"],
      immutable: true,
    };

    await this.artifactStore.put(gateDecision);

    await this.eventBus.publish({
      id: `evt-spec-gate-${Date.now()}`,
      type: passed ? "GATE_PASSED" : "GATE_BLOCKED",
      actorId: params.evaluatorActor.id,
      actorRole: params.evaluatorActor.role,
      payload: {
        gateId: gateDecision.id,
        gateType: "SPECIFICATION_GATE",
        status: gateDecision.status,
        evaluatedRequirements: params.requirementCodes,
        violations: allViolations,
      },
    });

    return gateDecision;
  }
}
