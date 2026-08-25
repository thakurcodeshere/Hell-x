/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 3: Design & UX Gate Evaluator
 */

import { DesignContract } from "../design/types.js";
import { GateDecisionArtifact } from "../core/artifacts.js";
import { ArtifactStore } from "../storage/artifact-store.js";
import { EventBus } from "../storage/event-bus.js";
import { AccessibilityEngine } from "../design/a11y-engine.js";
import { InteractionStateMachine } from "../design/state-machine.js";
import { Actor } from "../core/types.js";

export class DesignGateEvaluator {
  private a11yEngine: AccessibilityEngine;
  private stateMachine: InteractionStateMachine;

  constructor(
    private artifactStore: ArtifactStore,
    private eventBus: EventBus,
    a11yEngine?: AccessibilityEngine,
    stateMachine?: InteractionStateMachine
  ) {
    this.a11yEngine = a11yEngine || new AccessibilityEngine();
    this.stateMachine = stateMachine || new InteractionStateMachine();
  }

  public async evaluateDesignReadiness(params: {
    gateId: string;
    contract: DesignContract;
    evaluatorActor: Actor;
    justification: string;
  }): Promise<GateDecisionArtifact> {
    const violations: string[] = [];

    // 1. Screen traceability
    for (const screen of params.contract.screens) {
      if (screen.traceRequirementCodes.length === 0) {
        violations.push(`Screen '${screen.name}' (${screen.id}) is untraceable to any requirement.`);
      }

      // 2. Component state machine verification
      for (const cmp of screen.components) {
        const stateCheck = this.stateMachine.validateComponentStateMachine(cmp);
        if (!stateCheck.valid) {
          violations.push(...stateCheck.violations);
        }
      }

      // 3. Accessibility check
      const a11yReport = this.a11yEngine.auditScreen(screen);
      if (a11yReport.score < 0.75) {
        violations.push(
          `Screen '${screen.name}' accessibility score ${a11yReport.score * 100}% is below threshold (75%). Violations: [${a11yReport.violations.join(", ")}]`
        );
      }
    }

    const passed = violations.length === 0;
    const gateDecision: GateDecisionArtifact = {
      id: params.gateId,
      type: "GATE_DECISION",
      code: `GATE-DESIGN-${Date.now().toString().slice(-4)}`,
      gateType: "EXECUTION_GATE",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: params.evaluatorActor.id,
      authorRole: params.evaluatorActor.role,
      status: passed ? "PASSED" : "BLOCKED",
      evaluatedRequirements: params.contract.traceRequirementCodes,
      attachedEvidenceIds: [],
      violations,
      approvedByActorId: params.evaluatorActor.id,
      approvedByActorType: params.evaluatorActor.type === "HUMAN" ? "HUMAN" : "SYSTEM_EVALUATOR",
      justification: params.justification,
      dependencies: params.contract.screens.map((s) => s.id),
      tags: ["design-gate", "ux"],
      immutable: true,
    };

    await this.artifactStore.put(gateDecision);

    await this.eventBus.publish({
      id: `evt-design-gate-${Date.now()}`,
      type: passed ? "GATE_PASSED" : "GATE_BLOCKED",
      actorId: params.evaluatorActor.id,
      actorRole: params.evaluatorActor.role,
      payload: {
        gateId: gateDecision.id,
        gateType: "DESIGN_GATE",
        status: gateDecision.status,
        evaluatedRequirements: gateDecision.evaluatedRequirements,
        violations,
      },
    });

    return gateDecision;
  }
}
