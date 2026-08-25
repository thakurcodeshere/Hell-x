import { describe, it, expect } from "vitest";
import { MissionControlOrchestrator } from "../src/mission/mission-orchestrator.js";
import { EngineeringOS } from "../src/core/engine.js";

describe("MissionControlOrchestrator (Phase 8 / Section 36 & 39)", () => {
  it("executes an end-to-end autonomous mission passing all 6 gates", async () => {
    const os = new EngineeringOS();
    await os.initialize();

    const orchestrator = new MissionControlOrchestrator(os);
    const result = await orchestrator.executeMission(
      "Build Multi-Tenant Invoice Billing System with Stripe"
    );

    expect(result.success).toBe(true);
    expect(result.allGatesPassed).toBe(true);
    expect(result.passedGates.length).toBe(6);
    expect(result.passedGates).toContain("SPECIFICATION_GATE");
    expect(result.passedGates).toContain("ARCHITECTURE_GATE");
    expect(result.passedGates).toContain("DESIGN_GATE");
    expect(result.passedGates).toContain("EXECUTION_GATE");
    expect(result.passedGates).toContain("VERIFICATION_GATE");
    expect(result.passedGates).toContain("RELEASE_GATE");
    expect(result.finalState).toBe("MISSION_COMPLETED");
  });
});
