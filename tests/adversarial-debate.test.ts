import { describe, it, expect } from "vitest";
import { DialecticDebateEngine } from "../src/debate/dialectic-debate-engine.js";
import { EventBus } from "../src/storage/event-bus.js";

describe("Adversarial Multi-Agent Dialectic Debate (Milestone 13 / Section 30)", () => {
  it("executes 3-round Red-Team vs Blue-Team debate and issues formal arbiter verdict", () => {
    const eventBus = new EventBus();
    const engine = new DialecticDebateEngine(eventBus);

    const { rounds, verdict } = engine.conductDebate({
      id: "topic-adr-billing-01",
      title: "ADR-001: PostgreSQL + Redis Idempotent Billing Architecture",
      category: "ARCHITECTURE_ADR",
      proposalSummary: "Implement distributed locks and unique database constraints for payment charging",
    });

    expect(rounds.length).toBe(3);
    expect(rounds[0].attack.severity).toBe("CRITICAL");
    expect(rounds[0].defense.remediedInCode).toBe(true);
    expect(rounds[1].attack.cweClassification).toBe("CWE-362"); // Race Condition

    expect(verdict.overallDefenseScore).toBeGreaterThanOrEqual(85);
    expect(verdict.isApprovedForGate).toBe(true);
    expect(verdict.arbiterRulings.length).toBe(3);
  });
});
