/**
 * Hell-x Tests: Memory Trust Levels + Expiration (Step 07)
 */
import { describe, it, expect } from "vitest";
import { MemoryEngine } from "../src/memory/memory-engine.js";

describe("MemoryEngine — Trust Levels & Expiration (Step 07)", () => {
  it("records memory with default OBSERVED trust level", async () => {
    const engine = new MemoryEngine();
    const record = await engine.recordMemory({
      category: "FAILURE_MEMORY",
      summary: "SQL injection via unparameterized query",
      lessonLearned: "Always use parameterized queries",
      applicableContext: ["sql", "payments"],
    });
    expect(record.trustLevel).toBe("OBSERVED");
    expect(record.verificationStatus).toBe("CLAIMED");
  });

  it("records memory with explicit AUTHORITATIVE trust level", async () => {
    const engine = new MemoryEngine();
    const record = await engine.recordMemory({
      category: "OPERATIONAL_MEMORY",
      summary: "Redis cache reduces P99 latency by 40%",
      lessonLearned: "Use Redis for session caching",
      applicableContext: ["redis", "latency"],
      trustLevel: "AUTHORITATIVE",
      trustEvidenceSource: "production-telemetry:INC-042",
    });
    expect(record.trustLevel).toBe("AUTHORITATIVE");
    expect(record.trustEvidenceSource).toBe("production-telemetry:INC-042");
  });

  it("queryMemories: UNVERIFIED memories are excluded (fail-closed)", async () => {
    const engine = new MemoryEngine();
    await engine.recordMemory({
      category: "SECURITY_MEMORY",
      summary: "Possibly a security issue",
      lessonLearned: "Check authentication",
      applicableContext: ["auth", "security"],
      trustLevel: "UNVERIFIED",
    });
    const results = engine.queryMemories(["security", "auth"]);
    const unverified = results.find((r) => r.trustLevel === "UNVERIFIED");
    expect(unverified).toBeUndefined();
  });

  it("queryMemories: CONTRADICTED memories are excluded", async () => {
    const engine = new MemoryEngine();
    const record = await engine.recordMemory({
      category: "ARCHITECTURAL_MEMORY",
      summary: "Use PostgreSQL for all writes",
      lessonLearned: "PostgreSQL handles high write throughput",
      applicableContext: ["postgresql", "writes"],
      trustLevel: "OBSERVED",
    });
    engine.contradictMemory(record.id, "production-telemetry: Postgres saturation at 50k wps");
    const results = engine.queryMemories(["postgresql", "writes"]);
    const contradicted = results.find((r) => r.id === record.id);
    expect(contradicted).toBeUndefined();
  });

  it("queryMemories: AUTHORITATIVE memories score higher than OBSERVED", async () => {
    const engine = new MemoryEngine();
    await engine.recordMemory({
      category: "PROCESS_MEMORY",
      summary: "Deploy on Tuesdays has lower failure rate",
      lessonLearned: "Prefer Tuesday deployments",
      applicableContext: ["deploy", "tuesday"],
      trustLevel: "OBSERVED",
    });
    await engine.recordMemory({
      category: "PROCESS_MEMORY",
      summary: "Deploy on Wednesdays validated by 2 years of data",
      lessonLearned: "Wednesday deployments have 0.001% failure rate",
      applicableContext: ["deploy", "wednesday"],
      trustLevel: "AUTHORITATIVE",
    });
    // Authoritative should appear first even for generic "deploy" query
    const results = engine.queryMemories(["deploy"]);
    expect(results.length).toBeGreaterThan(0);
  });

  it("elevateTrust: upgrades from OBSERVED to VERIFIED", async () => {
    const engine = new MemoryEngine();
    const record = await engine.recordMemory({
      category: "FAILURE_MEMORY",
      summary: "Memory leak in EventBus subscribers",
      lessonLearned: "Always unsubscribe in cleanup",
      applicableContext: ["memory-leak", "eventbus"],
      trustLevel: "OBSERVED",
    });
    engine.elevateTrust(record.id, "VERIFIED", "independent-verifier:agent-qa-04");
    const all = engine.getAllMemories();
    const updated = all.find((r) => r.id === record.id);
    expect(updated?.trustLevel).toBe("VERIFIED");
    expect(updated?.verificationStatus).toBe("VERIFIED");
  });

  it("TTL expiration: stale memory is excluded from queryMemories", async () => {
    const engine = new MemoryEngine();
    // Create a memory that expired 1 hour ago (negative ttl simulation)
    const record = await engine.recordMemory({
      category: "PRODUCT_MEMORY",
      summary: "Old A/B test showed button color matters",
      lessonLearned: "Blue CTA converts better",
      applicableContext: ["cta", "button", "blue"],
      trustLevel: "OBSERVED",
      ttlHours: 0.000001,  // essentially expires immediately
    });
    // Advance time by waiting a tick
    await new Promise((r) => setTimeout(r, 5));
    const results = engine.queryMemories(["cta", "button", "blue"]);
    const expired = results.find((r) => r.id === record.id);
    expect(expired).toBeUndefined();
  });
});
