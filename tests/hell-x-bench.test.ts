/**
 * Hell-x Tests: hell-x-bench Public Benchmark Harness (Steps 15 & 16)
 */
import { describe, it, expect } from "vitest";
import { HellXBenchmarkHarness } from "../src/benchmark/hell-x-bench.js";

describe("HellXBenchmarkHarness — Standardized Engineering Benchmarks (Steps 15 & 16)", () => {
  const harness = new HellXBenchmarkHarness();

  it("lists all default benchmark task scenarios across categories", () => {
    const all = harness.listScenarios();
    expect(all.length).toBeGreaterThanOrEqual(3);

    const bugFix = harness.listScenarios("BUG_FIX");
    expect(bugFix.length).toBe(1);
    expect(bugFix[0].id).toBe("BENCH-01-BUG-FIX");

    const secHotfix = harness.listScenarios("SECURITY_HOTFIX");
    expect(secHotfix.length).toBe(1);
    expect(secHotfix[0].id).toBe("BENCH-05-SECURITY-HOTFIX");
  });

  it("evaluates clean fix output against hidden tests and scores 100% pass rate", () => {
    const scenario = harness.getScenario("BENCH-01-BUG-FIX");
    expect(scenario).toBeDefined();

    // Clean fix provided by Hell-x
    const result = harness.evaluateOutput({
      scenarioId: "BENCH-01-BUG-FIX",
      systemName: "Hell-x Engineering OS",
      modifiedCodebase: {
        "src/pagination.ts": "export function paginate(items: any[], page: number, size: number) { const start = (page - 1) * size; return items.slice(start, start + size); }",
      },
      tokensUsed: 1450,
      estimatedCostUsd: 0.0058,
      durationMs: 1200,
      evidenceGenerated: true,
    });

    expect(result.passedAllHiddenTests).toBe(true);
    expect(result.hiddenTestsPassed).toBe(1);
    expect(result.escapedDefectsCount).toBe(0);
    expect(result.mutationKillRate).toBe(1.0);
    expect(result.cryptographicSignature.length).toBe(64);
  });

  it("detects defect in broken output and calculates escaped defect count", () => {
    // Defective output (retaining bug)
    const result = harness.evaluateOutput({
      scenarioId: "BENCH-01-BUG-FIX",
      systemName: "Naive Copilot",
      modifiedCodebase: {
        "src/pagination.ts": "export function paginate(items: any[], page: number, size: number) { const start = (page - 1) * size; return items.slice(start, start + size - 1); }",
      },
      tokensUsed: 4200,
      estimatedCostUsd: 0.0168,
      durationMs: 3400,
      evidenceGenerated: false,
    });

    expect(result.passedAllHiddenTests).toBe(false);
    expect(result.escapedDefectsCount).toBe(1);
    expect(result.mutationKillRate).toBe(0.0);
  });

  it("compares two systems head-to-head and declares correct winner", () => {
    const runA = [
      harness.evaluateOutput({
        scenarioId: "BENCH-01-BUG-FIX",
        systemName: "Hell-x",
        modifiedCodebase: {
          "src/pagination.ts": "export function paginate(items: any[], page: number, size: number) { const start = (page - 1) * size; return items.slice(start, start + size); }",
        },
        tokensUsed: 1200,
        estimatedCostUsd: 0.004,
        durationMs: 1000,
        evidenceGenerated: true,
      }),
    ];

    const runB = [
      harness.evaluateOutput({
        scenarioId: "BENCH-01-BUG-FIX",
        systemName: "Ordinary Agent",
        modifiedCodebase: {
          "src/pagination.ts": "export function paginate(items: any[], page: number, size: number) { return items.slice(0, 5); }",
        },
        tokensUsed: 3800,
        estimatedCostUsd: 0.015,
        durationMs: 2500,
        evidenceGenerated: false,
      }),
    ];

    const comparison = harness.compareSystems(runA, runB);
    expect(comparison.overallWinner).toBe("Hell-x");
    expect(comparison.systemAPassRate).toBe(1.0);
    expect(comparison.systemBPassRate).toBe(0.0);
    expect(comparison.relativeCostEfficiency).toBeGreaterThan(3.0);
  });
});
