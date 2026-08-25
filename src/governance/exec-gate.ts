/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 4: Execution Gate Evaluator
 */

import { OrchestratorTask } from "../orchestrator/types.js";
import { GateDecisionArtifact } from "../core/artifacts.js";
import { ArtifactStore } from "../storage/artifact-store.js";
import { EventBus } from "../storage/event-bus.js";
import { Actor } from "../core/types.js";

export class ExecutionGateEvaluator {
  constructor(
    private artifactStore: ArtifactStore,
    private eventBus: EventBus
  ) {}

  public async evaluateExecutionReadiness(params: {
    gateId: string;
    tasks: OrchestratorTask[];
    evaluatorActor: Actor;
    justification: string;
  }): Promise<GateDecisionArtifact> {
    const violations: string[] = [];

    for (const task of params.tasks) {
      if (task.status !== "VERIFIED" && task.status !== "MERGED") {
        violations.push(`Task '${task.code}' is in unverified state: '${task.status}'.`);
      }

      if (!task.verification) {
        violations.push(`Task '${task.code}' has no attached verification record.`);
      } else {
        // Enforce self-review check at gate level
        if (task.submission && task.verification.verifierId === task.submission.workerId) {
          violations.push(`CRITICAL: Task '${task.code}' was self-reviewed by worker '${task.submission.workerId}'.`);
        }
      }
    }

    const passed = violations.length === 0;
    const gateDecision: GateDecisionArtifact = {
      id: params.gateId,
      type: "GATE_DECISION",
      code: `GATE-EXEC-${Date.now().toString().slice(-4)}`,
      gateType: "EXECUTION_GATE",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: params.evaluatorActor.id,
      authorRole: params.evaluatorActor.role,
      status: passed ? "PASSED" : "BLOCKED",
      evaluatedRequirements: params.tasks.map((t) => t.code),
      attachedEvidenceIds: params.tasks
        .map((t) => t.verification?.evidenceId)
        .filter((id): id is string => !!id),
      violations,
      approvedByActorId: params.evaluatorActor.id,
      approvedByActorType: params.evaluatorActor.type === "HUMAN" ? "HUMAN" : "SYSTEM_EVALUATOR",
      justification: params.justification,
      dependencies: params.tasks.map((t) => t.id),
      tags: ["execution-gate", "multi-agent"],
      immutable: true,
    };

    await this.artifactStore.put(gateDecision);

    await this.eventBus.publish({
      id: `evt-exec-gate-${Date.now()}`,
      type: passed ? "GATE_PASSED" : "GATE_BLOCKED",
      actorId: params.evaluatorActor.id,
      actorRole: params.evaluatorActor.role,
      payload: {
        gateId: gateDecision.id,
        gateType: "EXECUTION_GATE",
        status: gateDecision.status,
        evaluatedTasks: params.tasks.map((t) => t.code),
        violations,
      },
    });

    return gateDecision;
  }
}
