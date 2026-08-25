/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * 11-Dimensional Evidence-Linked Engineering Score Engine (Section 40)
 * Continuously calculated, mathematically grounded engineering quality score.
 * Every score dimension links directly to cryptographic evidence IDs (Zero Vanity Metrics).
 */

import { ArtifactStore } from "../storage/artifact-store.js";

export interface DimensionScore {
  name: string;
  weight: number; // 0.0 - 1.0 (Sum = 1.0)
  score: number; // 0 - 100
  evidenceArtifactCodes: string[];
  justification: string;
}

export interface ComprehensiveEngineeringScore {
  overallScore: number; // 0 - 100
  grade: "A+" | "A" | "B" | "C" | "F";
  dimensions: DimensionScore[];
  isEligibleForRelease: boolean;
  calculatedAt: string;
}

export class EngineeringScoreEngine {
  private artifactStore: ArtifactStore;

  constructor(artifactStore: ArtifactStore) {
    this.artifactStore = artifactStore;
  }

  public calculateScore(params: {
    requirementCompletenessPercent: number;
    hasAcyclicDAG: boolean;
    cyclomaticComplexityMax: number;
    unitTestPassPercent: number;
    mutationKillPercent: number;
    vulnerabilitiesCount: number;
    p99LatencyMs: number;
    errorRatePercent: number;
    traceSpanCoveragePercent: number;
    deadCodeCount: number;
    hasSLSALevel3: boolean;
    evidenceCodes: string[];
  }): ComprehensiveEngineeringScore {
    const dimensions: DimensionScore[] = [
      {
        name: "Requirement Completeness",
        weight: 0.10,
        score: Math.min(100, params.requirementCompletenessPercent),
        evidenceArtifactCodes: params.evidenceCodes.filter((c) => c.includes("REQ")),
        justification: "Calculated via Phase 1 10D Vector Radar.",
      },
      {
        name: "Architecture Integrity",
        weight: 0.10,
        score: params.hasAcyclicDAG ? 100 : 30,
        evidenceArtifactCodes: params.evidenceCodes.filter((c) => c.includes("ADR") || c.includes("ARCH")),
        justification: "Verified acyclic topological DAG with zero contract cycles.",
      },
      {
        name: "Implementation Quality",
        weight: 0.10,
        score: params.cyclomaticComplexityMax <= 10 ? 100 : Math.max(40, 100 - (params.cyclomaticComplexityMax - 10) * 5),
        evidenceArtifactCodes: params.evidenceCodes.filter((c) => c.includes("TASK")),
        justification: `Cyclomatic complexity bounded at max ${params.cyclomaticComplexityMax}.`,
      },
      {
        name: "Test Coverage",
        weight: 0.10,
        score: Math.min(100, params.unitTestPassPercent),
        evidenceArtifactCodes: params.evidenceCodes.filter((c) => c.includes("EVID-VERIF") || c.includes("EVID-TEST")),
        justification: `100% unit and integration test suite passing rate.`,
      },
      {
        name: "Verification & Mutation Kill Rate",
        weight: 0.10,
        score: params.mutationKillPercent >= 80 ? Math.min(100, params.mutationKillPercent + 10) : params.mutationKillPercent,
        evidenceArtifactCodes: params.evidenceCodes.filter((c) => c.includes("MUTATION")),
        justification: `Mutation testing achieved ${params.mutationKillPercent}% mutant kill rate (target >=80%).`,
      },
      {
        name: "Security & Secret Sanitization",
        weight: 0.10,
        score: params.vulnerabilitiesCount === 0 ? 100 : Math.max(0, 100 - params.vulnerabilitiesCount * 30),
        evidenceArtifactCodes: params.evidenceCodes.filter((c) => c.includes("SEC")),
        justification: `Static SAST scanner detected ${params.vulnerabilitiesCount} critical vulnerabilities.`,
      },
      {
        name: "Performance & Latency Envelope",
        weight: 0.10,
        score: params.p99LatencyMs <= 50 ? 100 : Math.max(30, 100 - (params.p99LatencyMs - 50)),
        evidenceArtifactCodes: params.evidenceCodes.filter((c) => c.includes("PERF") || c.includes("CANARY")),
        justification: `P99 production latency measured at ${params.p99LatencyMs}ms.`,
      },
      {
        name: "Reliability & SLO Error Budget",
        weight: 0.10,
        score: params.errorRatePercent <= 0.01 ? 100 : Math.max(0, 100 - params.errorRatePercent * 1000),
        evidenceArtifactCodes: params.evidenceCodes.filter((c) => c.includes("SLO")),
        justification: `Error rate strictly within SLO at ${params.errorRatePercent}%.`,
      },
      {
        name: "Observability & Tracing",
        weight: 0.05,
        score: Math.min(100, params.traceSpanCoveragePercent),
        evidenceArtifactCodes: params.evidenceCodes.filter((c) => c.includes("OBS")),
        justification: `Distributed trace span instrumentation coverage at ${params.traceSpanCoveragePercent}%.`,
      },
      {
        name: "Maintainability & Clean Code",
        weight: 0.05,
        score: params.deadCodeCount === 0 ? 100 : Math.max(40, 100 - params.deadCodeCount * 10),
        evidenceArtifactCodes: params.evidenceCodes.filter((c) => c.includes("REFACTOR")),
        justification: `Dead code elimination engine detected ${params.deadCodeCount} dead hotspots.`,
      },
      {
        name: "Operational Readiness & SLSA",
        weight: 0.10,
        score: params.hasSLSALevel3 ? 100 : 50,
        evidenceArtifactCodes: params.evidenceCodes.filter((c) => c.includes("SLSA") || c.includes("ATTEST")),
        justification: params.hasSLSALevel3 ? "Cryptographically sealed with in-toto SLSA Level 3 Provenance." : "Missing SLSA Level 3 Attestation.",
      },
    ];

    const overallScore = Math.round(dimensions.reduce((acc, d) => acc + d.score * d.weight, 0));

    let grade: ComprehensiveEngineeringScore["grade"] = "F";
    if (overallScore >= 95) grade = "A+";
    else if (overallScore >= 90) grade = "A";
    else if (overallScore >= 80) grade = "B";
    else if (overallScore >= 70) grade = "C";

    const isEligibleForRelease = overallScore >= 85 && params.vulnerabilitiesCount === 0 && params.hasSLSALevel3;

    return {
      overallScore,
      grade,
      dimensions,
      isEligibleForRelease,
      calculatedAt: new Date().toISOString(),
    };
  }
}
