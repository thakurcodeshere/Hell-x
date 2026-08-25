/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 7: Memory & Continuous Learning Gate Evaluator
 */

import { MemoryEngine } from "../memory/memory-engine.js";
import { DistillationEngine } from "../memory/distillation-engine.js";
import { AgentReputationEngine } from "../memory/reputation-engine.js";
import { GateDecisionArtifact } from "../core/artifacts.js";
import { ArtifactStore } from "../storage/artifact-store.js";
import { EventBus } from "../storage/event-bus.js";
import { Actor } from "../core/types.js";

export class MemoryGateEvaluator {
  constructor(
    private artifactStore: ArtifactStore,
    private eventBus: EventBus,
    private memoryEngine: MemoryEngine,
    private distillationEngine: DistillationEngine,
    private reputationEngine: AgentReputationEngine
  ) {}

  public async evaluateMemoryReadiness(params: {
    gateId: string;
    targetContext: string[];
    evaluatorActor: Actor;
    justification: string;
  }): Promise<GateDecisionArtifact> {
    const violations: string[] = [];

    // 1. Memory existence check
    const allMemories = this.memoryEngine.getAllMemories();
    if (allMemories.length === 0) {
      violations.push("Zero memory records stored in 8-tier hierarchical memory substrate.");
    }

    // 2. Distilled rules check
    const distilledRules = this.distillationEngine.distillPreventativeRules();
    const failureMemories = this.memoryEngine.getMemoriesByCategory("FAILURE_MEMORY");
    if (failureMemories.length > 0 && distilledRules.length === 0) {
      violations.push("Failure memories exist but zero preventative rules were distilled.");
    }

    const passed = violations.length === 0;
    const gateDecision: GateDecisionArtifact = {
      id: params.gateId,
      type: "GATE_DECISION",
      code: `GATE-MEM-${Date.now().toString().slice(-4)}`,
      gateType: "EXECUTION_GATE",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: params.evaluatorActor.id,
      authorRole: params.evaluatorActor.role,
      status: passed ? "PASSED" : "BLOCKED",
      evaluatedRequirements: params.targetContext,
      attachedEvidenceIds: [],
      violations,
      approvedByActorId: params.evaluatorActor.id,
      approvedByActorType: params.evaluatorActor.type === "HUMAN" ? "HUMAN" : "SYSTEM_EVALUATOR",
      justification: params.justification,
      dependencies: allMemories.map((m) => m.id),
      tags: ["memory-gate", "continuous-learning"],
      immutable: true,
    };

    await this.artifactStore.put(gateDecision);

    await this.eventBus.publish({
      id: `evt-mem-gate-${Date.now()}`,
      type: passed ? "GATE_PASSED" : "GATE_BLOCKED",
      actorId: params.evaluatorActor.id,
      actorRole: params.evaluatorActor.role,
      payload: {
        gateId: gateDecision.id,
        gateType: "MEMORY_GATE",
        status: gateDecision.status,
        targetContext: params.targetContext,
        violations,
      },
    });

    return gateDecision;
  }
}
