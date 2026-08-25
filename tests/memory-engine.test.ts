import { describe, it, expect } from "vitest";
import { MemoryEngine } from "../src/memory/memory-engine.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";
import { EventBus } from "../src/storage/event-bus.js";

describe("MemoryEngine (Phase 7 / Section 30)", () => {
  it("stores, reinforces, and retrieves memories across 8 tiers", async () => {
    const store = new ArtifactStore();
    await store.initialize();
    const bus = new EventBus();
    await bus.initialize();

    const engine = new MemoryEngine(store, bus);

    // Record memory
    const mem1 = await engine.recordMemory({
      category: "FAILURE_MEMORY",
      summary: "Canary rollback due to unindexed query",
      lessonLearned: "Always add foreign key index before deploying migration",
      preventativeRule: "Require migration index review",
      applicableContext: ["database", "postgres", "canary"],
    });

    expect(mem1.reinforcementScore).toBe(1.0);

    // Reinforce same memory
    const memReinforced = await engine.recordMemory({
      category: "FAILURE_MEMORY",
      summary: "Canary rollback due to unindexed query",
      lessonLearned: "Always add foreign key index before deploying migration",
      applicableContext: ["database", "postgres", "canary"],
    });

    expect(memReinforced.reinforcementScore).toBe(1.5);
    expect(memReinforced.accessCount).toBe(2);

    // Context-weighted query
    const results = engine.queryMemories(["postgres", "migration"], "FAILURE_MEMORY");
    expect(results.length).toBe(1);
    expect(results[0].id).toBe(mem1.id);
  });
});
