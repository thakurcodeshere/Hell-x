/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 8: Autonomous Engineering Missions Types (Section 35 - 40)
 */

import { Role } from "../core/types.js";

export type MissionType =
  | "FEATURE_DELIVERY"
  | "AUTONOMOUS_REFACTOR"
  | "SECURITY_PATCHING"
  | "PERFORMANCE_OPTIMIZATION"
  | "INCIDENT_REMEDIATION";

export type MissionState =
  | "INTENT_RECEIVED"
  | "MISSION_PLANNED"
  | "SPEC_GATED"
  | "ARCH_GATED"
  | "DESIGN_GATED"
  | "TASK_GRAPH_DISPATCHED"
  | "WORKTREE_EXECUTING"
  | "PEER_VERIFIED"
  | "EXECUTION_GATED"
  | "VERIFICATION_GATED"
  | "RELEASE_GATED"
  | "CANARY_PROMOTED"
  | "MEMORY_DISTILLED"
  | "MISSION_COMPLETED"
  | "MISSION_FAILED";

export interface MissionPlan {
  id: string;
  type: MissionType;
  title: string;
  intentText: string;
  assignedLeadRole: Role;
  state: MissionState;
  targetRequirementCodes: string[];
  passedGates: string[];
  totalTasksCount: number;
  completedTasksCount: number;
  totalTokensUsed: number;
  totalCostUsd: number;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface RefactorProposal {
  id: string;
  targetFilePath: string;
  detectedIssue: "DEAD_CODE_EXPORT" | "HIGH_CYCLOMATIC_COMPLEXITY" | "DUPLICATED_LOGIC" | "DEPRECATED_API";
  originalSnippet: string;
  proposedSnippet: string;
  estimatedComplexityReduction: number;
  safetyProofRequired: "UNIT_TEST" | "INTEGRATION_TEST";
}

export interface SecurityPatchProposal {
  id: string;
  cweCode: string;
  vulnerabilityTitle: string;
  targetFilePath: string;
  vulnerableCode: string;
  patchedCode: string;
  verificationTestCode: string;
}

export interface MissionResult {
  missionId: string;
  type: MissionType;
  success: boolean;
  finalState: MissionState;
  allGatesPassed: boolean;
  passedGates: string[];
  executionTimeSeconds: number;
  artifactsProducedCount: number;
  releaseVersion?: string;
  distilledRuleCount: number;
}
