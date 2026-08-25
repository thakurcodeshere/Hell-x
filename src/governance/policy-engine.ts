/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Governance Policy Engine & Gate Rules Evaluator
 */

import { CalculatedRisk, RiskLevel, RiskVector } from "../core/types.js";
import { EvidenceArtifact, RequirementArtifact, TaskNodeArtifact } from "../core/artifacts.js";
import {
  EvidenceMissingError,
  GovernanceViolationError,
  SelfReviewViolationError,
} from "../core/errors.js";

export class PolicyEngine {
  /**
   * Calculates the multi-dimensional risk score (0.0 to 1.0)
   */
  public calculateRiskScore(vectors: RiskVector): CalculatedRisk {
    // Weights: Business (0.2), Security (0.25), Data (0.2), Architecture (0.15), Complexity (0.1), Exposure (0.05), Historical (0.05)
    const score =
      vectors.businessImpact * 0.2 +
      vectors.securitySurface * 0.25 +
      vectors.dataSensitivity * 0.2 +
      vectors.architecturalBlastRadius * 0.15 +
      vectors.changeComplexity * 0.1 +
      vectors.productionExposure * 0.05 +
      vectors.historicalDefectRate * 0.05;

    const normalizedScore = Number(Math.min(1.0, Math.max(0.0, score)).toFixed(4));

    let level: RiskLevel = "LOW";
    let requiredProcessDepth: CalculatedRisk["requiredProcessDepth"] = "FAST_LANE";

    if (normalizedScore >= 0.75) {
      level = "CRITICAL";
      requiredProcessDepth = "HIGH_ASSURANCE";
    } else if (normalizedScore >= 0.5) {
      level = "HIGH";
      requiredProcessDepth = "HIGH_ASSURANCE";
    } else if (normalizedScore >= 0.25) {
      level = "MEDIUM";
      requiredProcessDepth = "STANDARD";
    } else {
      level = "LOW";
      requiredProcessDepth = "FAST_LANE";
    }

    return {
      score: normalizedScore,
      level,
      requiredProcessDepth,
      vectors,
      mandatesHumanApproval: normalizedScore >= 0.6 || vectors.dataSensitivity > 0.7 || vectors.securitySurface > 0.7,
      mandatesIndependentVerifier: normalizedScore >= 0.25,
      mandatesThreatModel: normalizedScore >= 0.5,
    };
  }

  /**
   * Enforces Section 3: "NO AGENT IS THE SOLE AUTHORITY OVER ITS OWN OUTPUT"
   */
  public validateIndependentVerification(builderAgentId: string, verifierAgentId: string, artifactId: string): void {
    if (builderAgentId.trim() === verifierAgentId.trim()) {
      throw new SelfReviewViolationError(builderAgentId, verifierAgentId, artifactId);
    }
  }

  /**
   * Enforces Section 18: Evidence Verification Check
   */
  public validateEvidenceSufficiency(
    requirement: RequirementArtifact,
    task: TaskNodeArtifact,
    evidenceList: EvidenceArtifact[]
  ): { passed: boolean; violations: string[] } {
    const violations: string[] = [];

    if (evidenceList.length === 0) {
      violations.push(`Zero evidence artifacts submitted for requirement ${requirement.code}. Claims require proof.`);
    }

    // Check required execution proofs
    const providedTypes = new Set(evidenceList.map((e) => e.evidenceType));
    for (const requiredProof of task.executionProofRequired) {
      const isSatisfied = evidenceList.some(
        (e) => e.evidenceType === requiredProof || e.evidenceType.includes(requiredProof)
      );
      if (!isSatisfied) {
        violations.push(`Mandatory execution proof '${requiredProof}' was not found in evidence bundle.`);
      }
    }

    // Check that all provided evidence passed
    for (const ev of evidenceList) {
      if (!ev.verifiedPassed) {
        violations.push(`Evidence ${ev.code} (${ev.evidenceType}) failed verification.`);
      }
    }

    // Check builder != verifier for every piece of evidence
    for (const ev of evidenceList) {
      if (ev.verifierAgentId === task.authorId) {
        violations.push(
          `Evidence ${ev.code} was verified by the task builder (${task.authorId}). Independent verifier required.`
        );
      }
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Requirement Completeness Check (Section 8)
   */
  public validateRequirementCompleteness(requirement: RequirementArtifact): {
    passed: boolean;
    averageScore: number;
    violations: string[];
  } {
    const violations: string[] = [];
    const radar = requirement.completenessRadar;
    const scores = [
      radar.functional,
      radar.ux,
      radar.data,
      radar.security,
      radar.operational,
      radar.errorHandling,
      radar.compliance,
      radar.observability,
    ];

    const averageScore = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(3));

    if (averageScore < 0.7) {
      violations.push(
        `Requirement ${requirement.code} has completeness score ${averageScore} (below threshold 0.70).`
      );
    }

    if (requirement.explicitUnknowns.length > 3) {
      violations.push(
        `Requirement ${requirement.code} contains ${requirement.explicitUnknowns.length} unresolved unknowns.`
      );
    }

    return {
      passed: violations.length === 0,
      averageScore,
      violations,
    };
  }
}
