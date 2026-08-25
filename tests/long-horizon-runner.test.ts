/**
 * Hell-x Tests: Long-Horizon Mission Orchestration (Step 22)
 */
import { describe, it, expect } from "vitest";
import { LongHorizonMissionRunner } from "../src/mission/long-horizon-runner.js";
import { EngineeringOS } from "../src/core/engine.js";
import { MemoryEngine } from "../src/memory/memory-engine.js";
import { InvariantEngine } from "../src/governance/invariant-engine.js";

describe("LongHorizonMissionRunner — 500+ Interaction Mission Resilience (Step 22)", () => {
  it("orchestrates a 500-step mission with checkpointing, memory distillation, and goal alignment", async () => {
    const os = new EngineeringOS();
    await os.initialize();

    const memory = new MemoryEngine();
    const invariants = new InvariantEngine();
    const runner = new LongHorizonMissionRunner(os, memory, invariants);

    const result = await runner.executeLongHorizonMission({
      missionId: "MISSION-HORIZON-500",
      targetObjective: "End-to-End Enterprise Microservice Architecture Migration",
      totalEstimatedSteps: 500,
      checkpointIntervalSteps: 50,
      maxAllowedContextTokens: 128000,
    });

    expect(result.totalStepsCompleted).toBe(500);
    expect(result.checkpointsCreated).toBe(10); // 500 / 50 = 10 checkpoints
    expect(result.memoryDistillationsCount).toBe(5); // 500 / 100 = 5 distillations
    expect(result.finalGoalAlignmentScore).toBeGreaterThanOrEqual(0.92);
    expect(result.contextDegradationMitigated).toBe(true);
    expect(result.isMissionSuccessful).toBe(true);

    // Verify stored distilled memories
    const allMemories = memory.getAllMemories();
    expect(allMemories.length).toBeGreaterThanOrEqual(5);
  }, 20000);
});
