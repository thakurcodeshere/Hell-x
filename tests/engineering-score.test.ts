import { describe, it, expect } from "vitest";
import { EngineeringScoreEngine } from "../src/governance/engineering-score.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";

describe("Externally-Calibrated Engineering Score Engine (Phase 14 — Step 02 Hardened)", () => {
  it("calculates score across all 11 quality dimensions with external authority citations", () => {
    const store = new ArtifactStore();
    // Grade capped at B until external benchmark (Step 15) is completed
    const scoreEngine = new EngineeringScoreEngine(store, false);

    const score = scoreEngine.calculateScore({
      requirementCompletenessPercent: 100,
      hasAcyclicDAG: true,
      cyclomaticComplexityMax: 7,
      unitTestPassPercent: 100,
      mutationKillPercent: 88,
      vulnerabilitiesCount: 0,
      p99LatencyMs: 42,
      errorRatePercent: 0.001,
      traceSpanCoveragePercent: 98,
      deadCodeCount: 0,
      hasSLSALevel3: true,
      evidenceCodes: ["REQ-01", "ADR-01", "TASK-01", "EVID-VERIF-01", "MUTATION-01", "SEC-01", "SLSA-01"],
    });

    expect(score.overallScore).toBeGreaterThanOrEqual(85);
    // Grade is capped at B without external benchmark — NOT A+ (self-certification eliminated)
    expect(score.grade).toBe("B");
    expect(score.dimensions.length).toBe(11);
    expect(score.isEligibleForRelease).toBe(true);
    expect(score.scopeDisclaimer).toContain("SIMULATION");

    // Every dimension must have external authority
    for (const dim of score.dimensions) {
      expect(dim.externalAuthority.standardName.length).toBeGreaterThan(0);
    }

    const secDim = score.dimensions.find((d) => d.name.includes("Security"));
    expect(secDim?.score).toBe(100);
  });
});

