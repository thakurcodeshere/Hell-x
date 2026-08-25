import { describe, it, expect } from "vitest";
import { AgentReputationEngine } from "../src/memory/reputation-engine.js";

describe("AgentReputationEngine (Phase 7 / Section 32)", () => {
  const engine = new AgentReputationEngine();

  it("calculates agent reliability and defect penalty accurately", () => {
    // 3 tasks: 2 first-pass successes, 1 failure with 1 defect
    engine.recordTaskOutcome({
      agentId: "agent-backend-01",
      role: "BACKEND_SPECIALIST",
      passedFirstPass: true,
      defectsInjected: 0,
      tokensUsed: 1200,
      durationSeconds: 45,
    });

    engine.recordTaskOutcome({
      agentId: "agent-backend-01",
      role: "BACKEND_SPECIALIST",
      passedFirstPass: true,
      defectsInjected: 0,
      tokensUsed: 1500,
      durationSeconds: 50,
    });

    const score = engine.recordTaskOutcome({
      agentId: "agent-backend-01",
      role: "BACKEND_SPECIALIST",
      passedFirstPass: false,
      defectsInjected: 1,
      tokensUsed: 1800,
      durationSeconds: 65,
    });

    expect(score.tasksCompleted).toBe(3);
    expect(score.firstPassVerifications).toBe(2);
    expect(score.failedVerifications).toBe(1);
    expect(score.defectInjectionCount).toBe(1);
    // 2/3 = 0.67 - 0.1 defect penalty = ~0.57
    expect(score.reliabilityScore).toBeGreaterThanOrEqual(0.5);
    expect(score.reliabilityScore).toBeLessThanOrEqual(0.6);
  });
});
