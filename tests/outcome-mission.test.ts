import { describe, it, expect } from "vitest";
import { OutcomeMissionEngine } from "../src/mission/outcome-mission-engine.js";
import { EngineeringOS } from "../src/core/engine.js";

describe("Outcome-Driven Engineering Missions (Milestone 13 / Section 42)", () => {
  it("translates high-level business goal into competing hypotheses, twin simulation and canary promotion", async () => {
    const os = new EngineeringOS();
    await os.initialize();

    const engine = new OutcomeMissionEngine(os);

    const result = await engine.executeOutcomeMission({
      id: "goal-checkout-opt",
      desiredOutcome: "Improve checkout conversion by 8% without increasing P99 latency beyond 50ms",
      targetMetric: "CONVERSION_RATE",
      targetDeltaPercent: 8.0,
      constraints: ["Zero database schema locking", "Strict idempotency"],
    });

    expect(result.generatedHypotheses.length).toBe(2);
    expect(result.winningBranch).toBe("experiment/outcome-redis-prefetch");
    expect(result.allGatesCleared).toBe(true);
    expect(result.canaryPromoted).toBe(true);
    expect(result.finalMeasuredGainPercent).toBeGreaterThanOrEqual(8.0);
  }, 15000);
});
