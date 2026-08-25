import { describe, it, expect } from "vitest";
import { DigitalTwinEngine } from "../src/twin/digital-twin-engine.js";
import { BlastRadiusSimulator } from "../src/simulation/blast-radius-simulator.js";
import { EventBus } from "../src/storage/event-bus.js";

describe("Digital Twin & Blast Radius Simulation (Milestone 13 / Section 27 & 28)", () => {
  it("maintains live system architecture state and simulates breaking schema changes", () => {
    const eventBus = new EventBus();
    const twin = new DigitalTwinEngine(eventBus);

    const state = twin.getState();
    expect(state.nodes.length).toBeGreaterThanOrEqual(4);
    expect(state.overallHealthScore).toBe(0.98);

    // Simulate breaking schema change (dropping tenant_id)
    const delta = twin.simulateChange({
      id: "change-drop-tenant",
      targetNodeId: "node-billing-svc",
      proposedSchemaChanges: {
        table: "invoices",
        droppedColumns: ["tenant_id"],
        addedColumns: [],
      },
    });

    expect(delta.isSafeToApply).toBe(false);
    expect(delta.contractBreakingChanges.length).toBeGreaterThan(0);
    expect(delta.contractBreakingChanges[0].severity).toBe("CRITICAL");
    expect(delta.simulatedHealthScore).toBeLessThan(0.5);
  });

  it("predicts blast radius and cascading failure risks across microservice boundaries", () => {
    const eventBus = new EventBus();
    const twin = new DigitalTwinEngine(eventBus);
    const simulator = new BlastRadiusSimulator(twin);

    const blast = simulator.simulateBlastRadius({
      targetNodeId: "node-billing-svc",
      changeType: "SCHEMA_MIGRATION",
      touchesPrimaryDb: true,
      isBreakingChange: true,
    });

    expect(blast.riskTier).toBe("CRITICAL");
    expect(blast.cascadingFailureProbability).toBeGreaterThan(0.7);
    expect(blast.mitigationSteps.length).toBeGreaterThan(0);
    expect(blast.databaseLockContentionRisk).toBe(true);

    const cascade = simulator.simulateCascadingFailure("node-billing-svc");
    expect(cascade.propagationPath).toContain("node-gateway");
    expect(cascade.circuitBreakerTripped).toBe(true);
  });
});
