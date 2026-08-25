/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Evidence Trust Level System — Step 05
 *
 * Extends the evidence model with three trust levels:
 *   E0_ASSERTION:            Agent verbal claim. Never sufficient for release.
 *   E1_MACHINE:              Machine-generated proof (test result, compiler output, scan).
 *   E2_INDEPENDENT_REALITY:  External, independent verification (different model, prod telemetry, user experiment).
 *
 * Evidence Quality Score = Independence × Freshness × Coverage × Reproducibility
 *
 * External Authority:
 *   NIST SP 800-53 SI-7 (Information Integrity)
 *   SLSA v1.0 Build Provenance
 *   Hell-x Law 07: Claims require reproducible, cryptographic evidence
 */

export type EvidenceTrustLevel =
  | "E0_ASSERTION"          // Agent self-report. Zero gate weight.
  | "E1_MACHINE"            // Machine-generated: test runner, compiler, SAST scanner.
  | "E2_INDEPENDENT_REALITY"; // External: prod telemetry, user A/B, different-model verifier, public benchmark.

export interface EvidenceQualityScore {
  level: EvidenceTrustLevel;

  /**
   * 0.0 – 1.0: Was the evidence produced by a party independent of the builder?
   * 0.0 = same agent as builder. 1.0 = completely independent (different model, org, tool).
   */
  independence: number;

  /**
   * 0.0 – 1.0: How recently was this evidence collected?
   * Freshness decays exponentially: score = exp(-ageHours / 24).
   */
  freshness: number;

  /**
   * 0.0 – 1.0: What fraction of the requirement surface area does this evidence cover?
   */
  coverage: number;

  /**
   * 0.0 – 1.0: Can this evidence be deterministically reproduced by a third party?
   */
  reproducibility: number;

  /**
   * Composite confidence = geometric mean of the four dimensions.
   * High bar: all four must be strong to get high overall confidence.
   */
  overallConfidence: number;
}

/**
 * Minimum required evidence level per risk class.
 * Fail-closed: if evidence does not meet minimum, gate is BLOCKED.
 */
export const MINIMUM_EVIDENCE_LEVEL_BY_RISK: Record<string, EvidenceTrustLevel> = {
  R0: "E0_ASSERTION",       // trivial — agent word accepted
  R1: "E1_MACHINE",         // low — automated test required
  R2: "E1_MACHINE",         // moderate — automated test + scan required
  R3: "E2_INDEPENDENT_REALITY", // high — independent real-world evidence required
  R4: "E2_INDEPENDENT_REALITY", // critical — mandatory
  R5: "E2_INDEPENDENT_REALITY", // existential — mandatory + human approval
};

/**
 * Computes an EvidenceQualityScore from raw measurements.
 */
export function computeEvidenceQuality(params: {
  level: EvidenceTrustLevel;
  independenceScore: number;   // 0.0-1.0
  ageHours: number;            // how old is the evidence
  coveragePercent: number;     // 0-100
  isReproducible: boolean;
}): EvidenceQualityScore {
  const freshness = Math.exp(-params.ageHours / 24);
  const coverage = Math.min(1.0, params.coveragePercent / 100);
  const reproducibility = params.isReproducible ? 1.0 : 0.2;
  const independence = Math.min(1.0, Math.max(0.0, params.independenceScore));

  // Geometric mean — all dimensions must be strong
  const overallConfidence = Math.pow(
    independence * freshness * coverage * reproducibility,
    1 / 4
  );

  return {
    level: params.level,
    independence,
    freshness: Number(freshness.toFixed(4)),
    coverage: Number(coverage.toFixed(4)),
    reproducibility,
    overallConfidence: Number(overallConfidence.toFixed(4)),
  };
}

/**
 * Determines whether a given evidence level satisfies the minimum
 * required for a given risk class. Returns a structured result.
 */
export function evaluateEvidenceSufficiency(
  provided: EvidenceTrustLevel,
  riskClass: string,   // "R0" | "R1" | "R2" | "R3" | "R4" | "R5"
  quality?: EvidenceQualityScore
): { sufficient: boolean; reason: string } {
  const ORDER: EvidenceTrustLevel[] = ["E0_ASSERTION", "E1_MACHINE", "E2_INDEPENDENT_REALITY"];
  const required = MINIMUM_EVIDENCE_LEVEL_BY_RISK[riskClass] ?? "E1_MACHINE";

  const providedRank = ORDER.indexOf(provided);
  const requiredRank = ORDER.indexOf(required);

  if (providedRank < requiredRank) {
    return {
      sufficient: false,
      reason: `Evidence level '${provided}' insufficient for risk class ${riskClass}. Required: '${required}'.`,
    };
  }

  if (quality && quality.overallConfidence < 0.5) {
    return {
      sufficient: false,
      reason: `Evidence quality score ${quality.overallConfidence.toFixed(2)} below minimum threshold 0.50. Check independence, freshness, and coverage.`,
    };
  }

  return {
    sufficient: true,
    reason: `Evidence level '${provided}' satisfies risk class ${riskClass} requirement ('${required}').`,
  };
}
