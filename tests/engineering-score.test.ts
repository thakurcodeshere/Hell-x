import { describe, it, expect } from "vitest";
import { EngineeringScoreEngine } from "../src/governance/engineering-score.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";

describe("11-Dimensional Engineering Score Engine (Milestone 14 / Section 40)", () => {
  it("calculates comprehensive evidence-linked score across all 11 quality dimensions", () => {
    const store = new ArtifactStore();
    const scoreEngine = new EngineeringScoreEngine(store);

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

    expect(score.overallScore).toBeGreaterThanOrEqual(95);
    expect(score.grade).toBe("A+");
    expect(score.dimensions.length).toBe(11);
    expect(score.isEligibleForRelease).toBe(true);

    const secDim = score.dimensions.find((d) => d.name.includes("Security"));
    expect(secDim?.score).toBe(100);
  });
});
