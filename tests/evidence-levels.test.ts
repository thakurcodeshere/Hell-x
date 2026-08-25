/**
 * Hell-x Tests: Evidence Trust Levels (Step 05)
 */
import { describe, it, expect } from "vitest";
import {
  computeEvidenceQuality,
  evaluateEvidenceSufficiency,
  MINIMUM_EVIDENCE_LEVEL_BY_RISK,
} from "../src/verification/evidence-levels.js";

describe("Evidence Trust Levels — E0/E1/E2 System (Step 05)", () => {
  it("computes high quality for fresh, reproducible, independent E2 evidence", () => {
    const q = computeEvidenceQuality({
      level: "E2_INDEPENDENT_REALITY",
      independenceScore: 1.0,
      ageHours: 0,
      coveragePercent: 100,
      isReproducible: true,
    });
    expect(q.level).toBe("E2_INDEPENDENT_REALITY");
    expect(q.overallConfidence).toBeCloseTo(1.0, 1);
  });

  it("computes lower quality for stale evidence", () => {
    const fresh = computeEvidenceQuality({
      level: "E1_MACHINE",
      independenceScore: 0.8,
      ageHours: 0,
      coveragePercent: 80,
      isReproducible: true,
    });
    const stale = computeEvidenceQuality({
      level: "E1_MACHINE",
      independenceScore: 0.8,
      ageHours: 72,  // 3 days old
      coveragePercent: 80,
      isReproducible: true,
    });
    expect(fresh.overallConfidence).toBeGreaterThan(stale.overallConfidence);
  });

  it("evaluateEvidenceSufficiency: E0 is sufficient for R0 only", () => {
    const r0 = evaluateEvidenceSufficiency("E0_ASSERTION", "R0");
    expect(r0.sufficient).toBe(true);

    const r1 = evaluateEvidenceSufficiency("E0_ASSERTION", "R1");
    expect(r1.sufficient).toBe(false);
    expect(r1.reason).toContain("E1_MACHINE");
  });

  it("evaluateEvidenceSufficiency: E1 is insufficient for R3+", () => {
    const r3 = evaluateEvidenceSufficiency("E1_MACHINE", "R3");
    expect(r3.sufficient).toBe(false);
    expect(r3.reason).toContain("E2_INDEPENDENT_REALITY");
  });

  it("evaluateEvidenceSufficiency: E2 satisfies all risk classes", () => {
    for (const rc of ["R0", "R1", "R2", "R3", "R4", "R5"]) {
      const result = evaluateEvidenceSufficiency("E2_INDEPENDENT_REALITY", rc);
      expect(result.sufficient).toBe(true);
    }
  });

  it("evaluateEvidenceSufficiency: low quality score fails even for matching level", () => {
    const lowQuality = computeEvidenceQuality({
      level: "E2_INDEPENDENT_REALITY",
      independenceScore: 0.1,   // barely independent
      ageHours: 200,            // very stale
      coveragePercent: 10,      // low coverage
      isReproducible: false,
    });
    const result = evaluateEvidenceSufficiency("E2_INDEPENDENT_REALITY", "R3", lowQuality);
    expect(result.sufficient).toBe(false);
    expect(result.reason).toContain("0.50");
  });

  it("minimum evidence levels are correctly assigned per risk class", () => {
    expect(MINIMUM_EVIDENCE_LEVEL_BY_RISK["R0"]).toBe("E0_ASSERTION");
    expect(MINIMUM_EVIDENCE_LEVEL_BY_RISK["R1"]).toBe("E1_MACHINE");
    expect(MINIMUM_EVIDENCE_LEVEL_BY_RISK["R3"]).toBe("E2_INDEPENDENT_REALITY");
    expect(MINIMUM_EVIDENCE_LEVEL_BY_RISK["R5"]).toBe("E2_INDEPENDENT_REALITY");
  });
});
