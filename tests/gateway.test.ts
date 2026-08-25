import { describe, it, expect } from "vitest";
import { ModelRouter } from "../src/gateway/router.js";
import { CostTracker } from "../src/gateway/cost-tracker.js";

describe("AI Gateway & Cost Intelligence Router", () => {
  it("selects adversarial verifier tier for QA/Security roles", () => {
    const router = new ModelRouter();
    const tier = router.selectTier({
      taskType: "VERIFICATION",
      role: "SECURITY_TESTER",
      complexityScore: 0.4,
      riskScore: 0.4,
    });
    expect(tier).toBe("TIER_ADVERSARIAL_VERIFIER");
  });

  it("selects high reasoning tier for high risk tasks", () => {
    const router = new ModelRouter();
    const tier = router.selectTier({
      taskType: "ARCHITECTURE",
      role: "SYSTEM_ARCHITECT",
      complexityScore: 0.8,
      riskScore: 0.7,
    });
    expect(tier).toBe("TIER_HIGH_REASONING");
  });

  it("records token usage and calculates USD cost accurately", async () => {
    const costTracker = new CostTracker();
    const router = new ModelRouter({ costTracker });

    const res = await router.execute({
      taskId: "task-test-01",
      requirementCode: "REQ-AUTH-001",
      role: "BACKEND_ENGINEER",
      systemPrompt: "You are an expert backend engineer.",
      userPrompt: "Implement JWT signing logic.",
    });

    expect(res.costUsd).toBeGreaterThanOrEqual(0);
    expect(costTracker.getTotalCost()).toBe(res.costUsd);
    expect(costTracker.getCostForTask("task-test-01")).toBe(res.costUsd);
  });
});
