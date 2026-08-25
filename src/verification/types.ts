/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 5: Verification Engine & Evidence Network Types
 */

import { EvidenceType, EvidenceArtifact } from "../core/artifacts.js";
import { Role } from "../core/types.js";

export interface EvidenceBundle {
  id: string;
  requirementCode: string;
  taskId: string;
  commitHash: string;
  collectedEvidence: EvidenceArtifact[];
  verifierId: string;
  verifierRole: Role;
  createdAt: string;
}

export interface ClaimStatement {
  id: string;
  statement: string;
  authorId: string;
  authorRole: Role;
  targetRequirementCode: string;
  targetTaskId: string;
}

export interface ClaimProofPair {
  claim: ClaimStatement;
  attachedEvidence?: EvidenceArtifact;
  isProven: boolean;
  discrepancyNotes?: string;
}

export interface DiscrepancyReport {
  totalClaims: number;
  provenClaims: number;
  unprovenClaims: number;
  discrepancies: ClaimProofPair[];
  allClaimsProven: boolean;
}

export interface QuarantinedTest {
  testFile: string;
  testName: string;
  failCount: number;
  passCount: number;
  flakinessRate: number;
  quarantinedAt: string;
  reason: string;
}

export interface FlakinessReport {
  totalTestsEvaluated: number;
  flakyTestsDetected: number;
  quarantinedTests: QuarantinedTest[];
  suiteStabilityScore: number; // 0.0 - 1.0
}

export interface MutationVariant {
  id: string;
  sourceFile: string;
  originalCodeSnippet: string;
  mutatedCodeSnippet: string;
  mutationType: "CONDITION_INVERSION" | "MATH_OP_FLIP" | "RETURN_VALUE_TAMPER" | "BOUNDARY_OFF_BY_ONE";
  killed: boolean;
  killerTestName?: string;
}

export interface MutationReport {
  totalMutants: number;
  mutantsKilled: number;
  mutantsSurvived: number;
  mutationScore: number; // e.g. 0.85 = 85%
  isAcceptable: boolean; // >= 0.80
  mutants: MutationVariant[];
}

export interface SecurityVulnerability {
  id: string;
  cweCode: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  filePath: string;
  lineNumber?: number;
  remediationGuidance: string;
}

export interface SecurityScanResult {
  scannerName: string;
  filesScanned: number;
  vulnerabilities: SecurityVulnerability[];
  passed: boolean;
  score: number; // 0.0 - 1.0
}
