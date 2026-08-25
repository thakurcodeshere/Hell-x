/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Agent Reputation & Model Performance Tracking Engine (Section 32)
 */

import { AgentReputationScore } from "./types.js";
import { Role } from "../core/types.js";

export class AgentReputationEngine {
  private reputationScores: Map<string, AgentReputationScore> = new Map();

  public getOrCreateScore(agentId: string, role: Role, modelIdentifier: string = "gpt-4o"): AgentReputationScore {
    if (!this.reputationScores.has(agentId)) {
      this.reputationScores.set(agentId, {
        agentId,
        role,
        modelIdentifier,
        tasksCompleted: 0,
        firstPassVerifications: 0,
        failedVerifications: 0,
        defectInjectionCount: 0,
        reliabilityScore: 1.0,
        totalTokensUsed: 0,
        averageDurationSeconds: 0,
      });
    }
    return this.reputationScores.get(agentId)!;
  }

  /**
   * Records a task outcome for an agent
   */
  public recordTaskOutcome(params: {
    agentId: string;
    role: Role;
    passedFirstPass: boolean;
    defectsInjected: number;
    tokensUsed: number;
    durationSeconds: number;
  }): AgentReputationScore {
    const score = this.getOrCreateScore(params.agentId, params.role);
    score.tasksCompleted += 1;
    if (params.passedFirstPass) {
      score.firstPassVerifications += 1;
    } else {
      score.failedVerifications += 1;
    }
    score.defectInjectionCount += params.defectsInjected;
    score.totalTokensUsed += params.tokensUsed;

    // Recalculate average duration
    score.averageDurationSeconds = Number(
      ((score.averageDurationSeconds * (score.tasksCompleted - 1) + params.durationSeconds) / score.tasksCompleted).toFixed(1)
    );

    // Reliability calculation: first pass rate penalized by defect count
    const firstPassRate = score.tasksCompleted > 0 ? score.firstPassVerifications / score.tasksCompleted : 1.0;
    const defectPenalty = Math.min(0.5, score.defectInjectionCount * 0.1);
    score.reliabilityScore = Number(Math.max(0.0, Math.min(1.0, firstPassRate - defectPenalty)).toFixed(2));

    return score;
  }

  public getAllScores(): AgentReputationScore[] {
    return Array.from(this.reputationScores.values());
  }
}
