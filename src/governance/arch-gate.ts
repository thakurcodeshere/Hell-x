/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 2: Architecture Gate Evaluator & Blueprint Traceability Controller
 */

import { ArchitectureBlueprint } from "../blueprint/types.js";
import { GateDecisionArtifact } from "../core/artifacts.js";
import { ArtifactStore } from "../storage/artifact-store.js";
import { EventBus } from "../storage/event-bus.js";
import { DAGEngine } from "../graph/dag-engine.js";
import { Actor } from "../core/types.js";

export class ArchitectureGateEvaluator {
  constructor(
    private artifactStore: ArtifactStore,
    private eventBus: EventBus,
    private dagEngine?: DAGEngine
  ) {}

  public async evaluateArchitectureReadiness(params: {
    gateId: string;
    blueprint: ArchitectureBlueprint;
    evaluatorActor: Actor;
    justification: string;
  }): Promise<GateDecisionArtifact> {
    const violations: string[] = [];

    // 1. Traceability check: Every entity must link to at least 1 requirement
    for (const entity of params.blueprint.entities) {
      if (entity.traceRequirementCodes.length === 0) {
        violations.push(`Domain entity '${entity.name}' has no linked requirement codes (untraceable architecture).`);
      }
    }

    // 2. Traceability check: Every API contract must link to at least 1 requirement
    for (const api of params.blueprint.apiContracts) {
      if (api.traceRequirementCodes.length === 0) {
        violations.push(`API Endpoint '${api.method} ${api.path}' is untraceable to any requirement.`);
      }
    }

    // 3. Traceability check: Every DB schema must link to at least 1 requirement
    for (const schema of params.blueprint.databaseSchemas) {
      if (schema.traceRequirementCodes.length === 0) {
        violations.push(`Database table '${schema.tableName}' is untraceable to any requirement.`);
      }
    }

    // 4. DAG Cycle Check
    if (this.dagEngine) {
      if (this.dagEngine.hasCycle()) {
        violations.push("The Engineering DAG contains circular dependencies between architectural components.");
      }
    }

    // 5. Security Boundary Check
    if (!params.blueprint.securityModel || params.blueprint.securityModel.rbacRoles.length === 0) {
      violations.push("Security Model is incomplete: Missing RBAC role definitions.");
    }

    const passed = violations.length === 0;
    const gateDecision: GateDecisionArtifact = {
      id: params.gateId,
      type: "GATE_DECISION",
      code: `GATE-ARCH-${Date.now().toString().slice(-4)}`,
      gateType: "ARCHITECTURE_GATE",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: params.evaluatorActor.id,
      authorRole: params.evaluatorActor.role,
      status: passed ? "PASSED" : "BLOCKED",
      evaluatedRequirements: params.blueprint.traceRequirementCodes,
      attachedEvidenceIds: [],
      violations,
      approvedByActorId: params.evaluatorActor.id,
      approvedByActorType: params.evaluatorActor.type === "HUMAN" ? "HUMAN" : "SYSTEM_EVALUATOR",
      justification: params.justification,
      dependencies: params.blueprint.entities.map((e) => e.id),
      tags: ["architecture-gate"],
      immutable: true,
    };

    await this.artifactStore.put(gateDecision);

    await this.eventBus.publish({
      id: `evt-arch-gate-${Date.now()}`,
      type: passed ? "GATE_PASSED" : "GATE_BLOCKED",
      actorId: params.evaluatorActor.id,
      actorRole: params.evaluatorActor.role,
      payload: {
        gateId: gateDecision.id,
        gateType: "ARCHITECTURE_GATE",
        status: gateDecision.status,
        evaluatedRequirements: gateDecision.evaluatedRequirements,
        violations,
      },
    });

    return gateDecision;
  }
}
