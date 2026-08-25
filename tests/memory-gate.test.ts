import { describe, it, expect } from "vitest";
import { MemoryGateEvaluator } from "../src/governance/memory-gate.js";
import { MemoryEngine } from "../src/memory/memory-engine.js";
import { DistillationEngine } from "../src/memory/distillation-engine.js";
import { AgentReputationEngine } from "../src/memory/reputation-engine.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";
import { EventBus } from "../src/storage/event-bus.js";

describe("MemoryGateEvaluator (Layer 09 / Phase 7)", () => {
  it("approves memory gate when hierarchical memories exist and rules are distilled", async () => {
    const store = new ArtifactStore();
    await store.initialize();
    const bus = new EventBus();
    await bus.initialize();

    const memEngine = new MemoryEngine(store, bus);
    const distEngine = new DistillationEngine(memEngine);
    const repEngine = new AgentReputationEngine();

    await memEngine.recordMemory({
      category: "FAILURE_MEMORY",
      summary: "Rollback during canary",
      lessonLearned: "Always configure rollback down scripts",
      preventativeRule: "Require down migrations on PR",
      applicableContext: ["deployment", "database"],
    });

    const gate = new MemoryGateEvaluator(store, bus, memEngine, distEngine, repEngine);
    const result = await gate.evaluateMemoryReadiness({
      gateId: "gate-mem-01",
      targetContext: ["deployment", "database"],
      evaluatorActor: {
        id: "learning-agent",
        name: "Learning Sentinel",
        type: "SYSTEM_EVALUATOR",
        role: "SYSTEM_ARCHITECT",
        permissions: ["GATE_APPROVE"],
      },
      justification: "8-tier memory active, failure memories distilled, reputation tracking active.",
    });

    expect(result.status).toBe("PASSED");
    expect(result.violations.length).toBe(0);
  });
});
