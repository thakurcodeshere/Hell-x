import { describe, it, expect } from "vitest";
import { ComparativeBenchmarkArena } from "../src/benchmark/comparative-arena.js";
import { EngineeringOS } from "../src/core/engine.js";

describe("Comparative Benchmarking Arena (Phase 15)", () => {
  it("proves Hell-x Engineering OS outperforms ordinary coding agents under controlled conditions", async () => {
    const os = new EngineeringOS();
    await os.initialize();

    const arena = new ComparativeBenchmarkArena(os);

    const result = await arena.executeBenchmarkRun({
      id: "bench-fintech-saas-01",
      name: "Fintech Multi-Tenant Invoicing with Concurrency & Mutation Challenge",
      description: "Complex billing domain with hidden race condition and SQL injection traps",
      repoContext: "src/billing/service.ts",
      latentBugsInRepo: [
        { type: "SQL_INJECTION", description: "Unparameterized raw SQL concatenation" },
        { type: "RACE_CONDITION", description: "Missing Redlock on charge idempotency key" },
      ],
      complexRequirements: [
        "Enforce strict tenant isolation",
        "Achieve >=80% mutation kill rate",
        "Sub-50ms P99 latency",
      ],
    });

    expect(result.superiorityVerdict).toBe("HELLX_OUTPERFORMS_ORDINARY");
    expect(result.hellxOSScorecard.escapedDefectCount).toBe(0);
    expect(result.ordinaryAgentScorecard.escapedDefectCount).toBeGreaterThan(0);
    expect(result.hellxOSScorecard.mutationKillRatePercent).toBeGreaterThanOrEqual(80);
    expect(result.ordinaryAgentScorecard.mutationKillRatePercent).toBeLessThan(50);
    expect(result.costEfficiencyMultiplier).toBeGreaterThanOrEqual(3.0);
  });
});
