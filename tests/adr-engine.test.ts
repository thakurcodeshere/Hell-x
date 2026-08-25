import { describe, it, expect } from "vitest";
import { ADREngine } from "../src/blueprint/adr-engine.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";
import { EventBus } from "../src/storage/event-bus.js";

describe("ADREngine (Layer 04)", () => {
  it("proposes, records, and links ADRs with multi-option tradeoffs", async () => {
    const store = new ArtifactStore();
    await store.initialize();
    const bus = new EventBus();
    await bus.initialize();

    const adrEngine = new ADREngine(store, bus);
    const adr = await adrEngine.proposeADR({
      code: "ADR-010",
      title: "Select Distributed Cache Strategy",
      contextAndProblem: "Need distributed session and rate limiting cache.",
      decision: "Deploy Redis 7 Cluster.",
      alternativesConsidered: [
        { name: "Memcached", pros: ["Simple multi-threading"], cons: ["No complex data structures"] },
        { name: "Local Cache", pros: ["Zero network latency"], cons: ["Not distributed"] },
      ],
      consequencesPositive: ["Sub-ms operations", "Atomic token bucket script execution"],
      consequencesNegative: ["Additional infrastructure operational burden"],
      assumptions: ["Redis nodes have minimum 1Gbps networking"],
      affectedRequirements: ["REQ-AUTH-001"],
      securityConsiderations: "Enforce TLS in-transit and auth token passwords.",
    });

    expect(adr.code).toBe("ADR-010");
    expect(adr.status).toBe("ACCEPTED");
    expect(store.getByCode("ADR-010")?.id).toBe(adr.id);
    expect(bus.getEventsByType("ADR_ACCEPTED").length).toBe(1);
  });
});
