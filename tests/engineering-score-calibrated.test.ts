/**
 * Hell-x Tests: Externally-Calibrated Engineering Score + Benchmark Card (Steps 02 & 03)
 */
import { describe, it, expect } from "vitest";
import { EngineeringScoreEngine } from "../src/governance/engineering-score.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";
import {
  getBenchmarkCard,
  getSimulationScopeMetrics,
  HELL_X_BENCHMARK_CARD,
} from "../src/benchmark/benchmark-card.js";

const EVIDENCE = ["REQ-001", "ADR-001", "EVID-TEST-001", "SLSA-ATTEST-001", "SEC-SCAN-001"];

describe("EngineeringScoreEngine — Externally-Calibrated (Step 02)", () => {
  it("grade is capped at B without external benchmark", () => {
    const store = new ArtifactStore();
    const engine = new EngineeringScoreEngine(store, false); // no external benchmark
    const score = engine.calculateScore({
      requirementCompletenessPercent: 100,
      hasAcyclicDAG: true,
      cyclomaticComplexityMax: 5,
      unitTestPassPercent: 100,
      mutationKillPercent: 88,
      vulnerabilitiesCount: 0,
      p99LatencyMs: 51,
      errorRatePercent: 0,
      traceSpanCoveragePercent: 100,
      deadCodeCount: 0,
      hasSLSALevel3: true,
      evidenceCodes: EVIDENCE,
    });
    // Grade must NOT be A+ without external benchmark
    expect(score.grade).not.toBe("A+");
    expect(score.grade).not.toBe("A");
    expect(score.grade).toBe("B");
    expect(score.externalBenchmarkCompleted).toBe(false);
  });

  it("A+ grade only unlocked when external benchmark completed", () => {
    const store = new ArtifactStore();
    const engine = new EngineeringScoreEngine(store, true); // external benchmark done
    const score = engine.calculateScore({
      requirementCompletenessPercent: 100,
      hasAcyclicDAG: true,
      cyclomaticComplexityMax: 5,
      unitTestPassPercent: 100,
      mutationKillPercent: 88,
      vulnerabilitiesCount: 0,
      p99LatencyMs: 45,
      errorRatePercent: 0,
      traceSpanCoveragePercent: 100,
      deadCodeCount: 0,
      hasSLSALevel3: true,
      evidenceCodes: EVIDENCE,
    });
    expect(score.grade).toBe("A+");
    expect(score.overallScore).toBeGreaterThanOrEqual(95);
  });

  it("every dimension cites an external authority", () => {
    const store = new ArtifactStore();
    const engine = new EngineeringScoreEngine(store, false);
    const score = engine.calculateScore({
      requirementCompletenessPercent: 90,
      hasAcyclicDAG: true,
      cyclomaticComplexityMax: 8,
      unitTestPassPercent: 98,
      mutationKillPercent: 80,
      vulnerabilitiesCount: 0,
      p99LatencyMs: 80,
      errorRatePercent: 0.005,
      traceSpanCoveragePercent: 95,
      deadCodeCount: 0,
      hasSLSALevel3: true,
      evidenceCodes: EVIDENCE,
    });
    for (const dim of score.dimensions) {
      expect(dim.externalAuthority).toBeDefined();
      expect(dim.externalAuthority.standardName.length).toBeGreaterThan(0);
      expect(dim.externalAuthority.url.length).toBeGreaterThan(0);
    }
  });

  it("scope disclaimer is always included in report", () => {
    const store = new ArtifactStore();
    const engine = new EngineeringScoreEngine(store, false);
    const score = engine.calculateScore({
      requirementCompletenessPercent: 90,
      hasAcyclicDAG: true,
      cyclomaticComplexityMax: 8,
      unitTestPassPercent: 98,
      mutationKillPercent: 80,
      vulnerabilitiesCount: 0,
      p99LatencyMs: 80,
      errorRatePercent: 0.005,
      traceSpanCoveragePercent: 95,
      deadCodeCount: 0,
      hasSLSALevel3: true,
      evidenceCodes: EVIDENCE,
    });
    expect(score.scopeDisclaimer).toContain("SCOPE:");
    expect(score.scopeDisclaimer).toContain("SIMULATION");
  });
});

describe("Benchmark Disambiguation Card (Step 03)", () => {
  it("MTTR-001 card defines exactDefinition and scopeExclusions", () => {
    const card = getBenchmarkCard("MTTR-001");
    expect(card).toBeDefined();
    expect(card!.measurementScope).toBe("SIMULATION_IN_MEMORY");
    expect(card!.scopeExclusions.length).toBeGreaterThan(3);
    expect(card!.claimedValue).toContain("11ms");
  });

  it("SCORE-001 card explicitly retires the 100/100 A+ claim", () => {
    const card = getBenchmarkCard("SCORE-001");
    expect(card).toBeDefined();
    expect(card!.claimedValue).toContain("retired");
    expect(card!.scopeExclusions.some((e) => e.includes("100/100 A+"))).toBe(true);
  });

  it("MUTATION-001 card discloses hardcoded return value", () => {
    const card = getBenchmarkCard("MUTATION-001");
    expect(card).toBeDefined();
    expect(card!.exactDefinition).toContain("hardcoded");
    expect(card!.upgradeRequirements.some((r) => r.includes("Stryker"))).toBe(true);
  });

  it("all simulation-scope metrics are identified and flagged", () => {
    const simMetrics = getSimulationScopeMetrics();
    expect(simMetrics.length).toBeGreaterThanOrEqual(4);
    for (const m of simMetrics) {
      expect(m.measurementScope).toBe("SIMULATION_IN_MEMORY");
      expect(m.independentlyVerified).toBe(false);
      expect(m.upgradeRequirements.length).toBeGreaterThan(0);
    }
  });

  it("all benchmark cards have upgrade requirements defined", () => {
    for (const card of HELL_X_BENCHMARK_CARD) {
      expect(card.upgradeRequirements.length).toBeGreaterThan(0);
    }
  });
});
