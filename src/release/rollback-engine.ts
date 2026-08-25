/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Fast Rollback & Post-Mortem Failure Memory Engine (Section 26)
 */

import { DeploymentStatusRecord, DeploymentPlan, PostMortemReport } from "./types.js";
import { MemoryArtifact } from "../core/artifacts.js";
import { ArtifactStore } from "../storage/artifact-store.js";
import { EventBus } from "../storage/event-bus.js";

export class RollbackEngine {
  constructor(
    private artifactStore?: ArtifactStore,
    private eventBus?: EventBus
  ) {}

  /**
   * Executes sub-second fast rollback and records failure memory
   */
  public async executeFastRollback(
    deployment: DeploymentStatusRecord,
    plan: DeploymentPlan,
    triggeringViolation: string
  ): Promise<PostMortemReport> {
    const startTime = Date.now();

    // 1. Cut traffic to 0% immediately
    deployment.currentState = "ROLLED_BACK";
    deployment.trafficPercentage = 0;
    deployment.updatedAt = new Date().toISOString();

    const rollbackDurationMs = Date.now() - startTime;
    const memCodeSuffix = Date.now().toString().slice(-4);

    // 2. Synthesize failure memory artifact
    const memoryArtifact: MemoryArtifact = {
      id: `art-mem-fail-${memCodeSuffix}`,
      type: "MEMORY",
      code: `MEM-FAIL-${memCodeSuffix}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "agent-release-sentinel",
      authorRole: "SRE",
      category: "FAILURE_MEMORY",
      summary: `Automated rollback during deployment ${deployment.id} (${plan.releaseVersion})`,
      lessonLearned: `Deployment violated SLO: ${triggeringViolation}. Fast rollback executed in ${rollbackDurationMs}ms.`,
      preventativeRule: "Require pre-release canary soak test with synthetic load before 50% traffic step.",
      applicableContext: ["deployment", plan.targetEnvironment.toLowerCase(), "canary"],
      reinforcementScore: 1.0,
      dependencies: [],
      tags: ["post-mortem", "rollback", "incident"],
      immutable: true,
    };

    if (this.artifactStore) {
      await this.artifactStore.put(memoryArtifact);
    }

    // 3. Publish domain events
    if (this.eventBus) {
      await this.eventBus.publish({
        id: `evt-rollback-${deployment.id}-${Date.now()}`,
        type: "ROLLBACK_TRIGGERED",
        actorId: "agent-release-sentinel",
        actorRole: "SRE",
        payload: {
          deploymentId: deployment.id,
          planId: plan.id,
          targetVersion: plan.releaseVersion,
          triggeringViolation,
          durationMs: rollbackDurationMs,
        },
      });

      await this.eventBus.publish({
        id: `evt-mem-${memoryArtifact.id}-${Date.now()}`,
        type: "MEMORY_REINFORCED",
        actorId: "agent-release-sentinel",
        actorRole: "SRE",
        payload: {
          memoryCode: memoryArtifact.code,
          category: memoryArtifact.category,
          summary: memoryArtifact.summary,
        },
      });
    }

    const postMortem: PostMortemReport = {
      id: `pm-${deployment.id}-${Date.now().toString().slice(-4)}`,
      deploymentId: deployment.id,
      failedState: "ROLLING_BACK",
      triggeringMetric: triggeringViolation,
      rootCauseSummary: `SLO violation detected during canary phase: ${triggeringViolation}`,
      rollbackDurationMs,
      remediationActionTaken: `Traffic cut to 0%. Reverted to previous stable commit ${plan.rollbackPlan.previousStableCommitHash}.`,
      memoryArtifact,
      generatedAt: new Date().toISOString(),
    };

    return postMortem;
  }
}
