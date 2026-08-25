import { describe, it, expect } from "vitest";
import { EventBus } from "../src/storage/event-bus.js";
import { computeEventHash } from "../src/core/events.js";

describe("EventBus & Cryptographic Provenance", () => {
  it("chains events with SHA-256 hashes and verifies integrity", async () => {
    const bus = new EventBus();
    await bus.initialize();

    const evt1 = await bus.publish({
      id: "evt-1",
      type: "PROJECT_INITIALIZED",
      actorId: "actor-1",
      actorRole: "SYSTEM_ARCHITECT",
      payload: { name: "Test Project" },
    });

    const evt2 = await bus.publish({
      id: "evt-2",
      type: "REQUIREMENT_CREATED",
      actorId: "actor-2",
      actorRole: "PRODUCT_MANAGER",
      payload: { code: "REQ-001" },
    });

    expect(evt1.sequenceNumber).toBe(1);
    expect(evt1.previousEventHash).toBe("0".repeat(64));
    expect(evt2.sequenceNumber).toBe(2);
    expect(evt2.previousEventHash).toBe(evt1.currentEventHash);

    expect(bus.verifyChainIntegrity()).toBe(true);
  });

  it("notifies subscribed handlers on published events", async () => {
    const bus = new EventBus();
    await bus.initialize();

    const received: string[] = [];
    bus.subscribe("ADR_PROPOSED", (evt) => {
      received.push((evt.payload as any).code);
    });

    await bus.publish({
      id: "evt-adr-1",
      type: "ADR_PROPOSED",
      actorId: "architect-1",
      actorRole: "SYSTEM_ARCHITECT",
      payload: { code: "ADR-001" },
    });

    expect(received).toEqual(["ADR-001"]);
  });
});
