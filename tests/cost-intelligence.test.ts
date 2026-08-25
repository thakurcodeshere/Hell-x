import { describe, it, expect } from "vitest";
import { CostIntelligenceEngine } from "../src/economy/cost-intelligence.js";
import { EventBus } from "../src/storage/event-bus.js";

describe("Cost Intelligence & Economic Engine (Milestone 14 / Section 39)", () => {
  it("tracks micro-costs across LLM calls and computes ROI and cost per verified requirement", () => {
    const eventBus = new EventBus();
    const engine = new CostIntelligenceEngine(eventBus);

    engine.recordSpend({
      projectId: "proj-billing-01",
      featureId: "feat-invoicing",
      requirementCode: "REQ-INV-001",
      taskId: "task-01",
      agentId: "agent-backend-01",
      modelIdentifier: "gpt-4o",
      tokensPrompt: 1200,
      tokensCompletion: 800,
      costUSD: 0.0125,
    });

    engine.recordSpend({
      projectId: "proj-billing-01",
      featureId: "feat-invoicing",
      requirementCode: "REQ-INV-002",
      taskId: "task-02",
      agentId: "agent-qa-01",
      modelIdentifier: "claude-3-5-sonnet",
      tokensPrompt: 1500,
      tokensCompletion: 600,
      costUSD: 0.0135,
    });

    const metrics = engine.calculateMetrics({
      totalFeatures: 1,
      verifiedRequirementsCount: 2,
      successfulTasksCount: 2,
      escapedDefectsCount: 0,
    });

    expect(metrics.totalCostUSD).toBe(0.026);
    expect(metrics.totalTokensUsed).toBe(4100);
    expect(metrics.costPerVerifiedRequirementUSD).toBe(0.013);
    expect(metrics.roiMultiplier).toBeGreaterThan(100);
    expect(metrics.costEfficiencyScore).toBeGreaterThanOrEqual(0.9);
  });
});
