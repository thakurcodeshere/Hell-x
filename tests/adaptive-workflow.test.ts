import { describe, it, expect } from "vitest";
import { AdaptiveWorkflowEngine } from "../src/orchestrator/adaptive-workflow.js";

describe("Self-Designing Adaptive Workflow Engine (Milestone 14 / Section 45)", () => {
  it("dynamically configures workflow topology and gate strictness based on project risk", () => {
    const engine = new AdaptiveWorkflowEngine();

    // High Irreversible Risk Plan
    const highRisk = engine.designWorkflow({
      touchesDatabaseSchema: true,
      involvesPaymentOrSecurity: true,
      estimatedLinesOfCode: 500,
      blastRadiusNodeCount: 4,
    });
    expect(highRisk.riskProfile).toBe("HIGH_IRREVERSIBLE_RISK");
    expect(highRisk.requiresRedTeamDebate).toBe(true);
    expect(highRisk.requiresMultiSigHumanApproval).toBe(true);
    expect(highRisk.mutationKillRateTargetPercent).toBe(85);
    expect(highRisk.canaryProgressionSteps).toEqual([10, 25, 50, 100]);

    // Low Risk Plan
    const lowRisk = engine.designWorkflow({
      touchesDatabaseSchema: false,
      involvesPaymentOrSecurity: false,
      estimatedLinesOfCode: 40,
      blastRadiusNodeCount: 1,
    });
    expect(lowRisk.riskProfile).toBe("LOW_RISK");
    expect(lowRisk.requiresRedTeamDebate).toBe(false);
    expect(lowRisk.requiresMultiSigHumanApproval).toBe(false);
    expect(lowRisk.canaryProgressionSteps).toEqual([50, 100]);
  });
});
