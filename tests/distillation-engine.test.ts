import { describe, it, expect } from "vitest";
import { DistillationEngine } from "../src/memory/distillation-engine.js";
import { MemoryEngine } from "../src/memory/memory-engine.js";

describe("DistillationEngine (Phase 7 / Section 31 & 33)", () => {
  it("distills recurring failure memories into preventative rules", async () => {
    const memoryEngine = new MemoryEngine();

    await memoryEngine.recordMemory({
      category: "FAILURE_MEMORY",
      summary: "Canary rollback due to latency spike in payment auth",
      lessonLearned: "Use token bucket in Redis with local in-memory fallback",
      preventativeRule: "Require fallback cache on all auth microservices",
      applicableContext: ["security", "auth", "canary"],
    });

    const distillation = new DistillationEngine(memoryEngine);
    const rules = distillation.distillPreventativeRules();

    expect(rules.length).toBe(1);
    expect(rules[0].ruleStatement).toBe("Require fallback cache on all auth microservices");
    expect(rules[0].targetRole).toBe("SECURITY_ARCHITECT");
    expect(rules[0].enforcementAction).toBe("CONTEXT_PACK_INJECTION");

    const guardrail = distillation.generateSelfHealingGuardrail("MEM-FAIL-01", "Auth cache failure");
    expect(guardrail.status).toBe("ACTIVE");
    expect(guardrail.syntheticTestCaseCode).toContain("describe");
  });
});
