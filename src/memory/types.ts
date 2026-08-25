/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 7: Memory & Continuous Learning Types (Section 30 - 34)
 *
 * Step 07 — Memory Trust Levels + Expiration
 * External Authority:
 *   Hell-x Law 11: Failure Memory; Law 12: Continuous Learning
 *   NIST SP 800-53 SI-12 (Information Management and Retention)
 */

import { Role } from "../core/types.js";

export type MemoryCategory =
  | "PRODUCT_MEMORY"
  | "ARCHITECTURAL_MEMORY"
  | "DESIGN_MEMORY"
  | "FAILURE_MEMORY"
  | "AGENT_REPUTATION_MEMORY"
  | "OPERATIONAL_MEMORY"
  | "SECURITY_MEMORY"
  | "PROCESS_MEMORY";

/**
 * Memory trust hierarchy (ascending trust):
 *   UNVERIFIED  — model suggestion or single hypothesis; NEVER injected into agent context
 *   OBSERVED    — seen in at least one real execution cycle
 *   VERIFIED    — independently confirmed (independent verifier + evidence)
 *   AUTHORITATIVE — externally validated (production telemetry, public benchmark, human expert)
 */
export type MemoryTrustLevel = "UNVERIFIED" | "OBSERVED" | "VERIFIED" | "AUTHORITATIVE";

/** Whether a memory's lesson has been confirmed, contradicted, or is awaiting proof. */
export type MemoryVerificationStatus = "CLAIMED" | "VERIFIED" | "CONTRADICTED" | "EXPIRED";

export interface MemoryRecord {
  id: string;
  code: string;
  category: MemoryCategory;
  summary: string;
  lessonLearned: string;
  preventativeRule?: string;
  applicableContext: string[];
  reinforcementScore: number;
  accessCount: number;
  lastReinforcedAt: string;
  createdAt: string;

  // Trust & Expiration (Step 07)
  trustLevel: MemoryTrustLevel;
  verificationStatus: MemoryVerificationStatus;
  /** ISO timestamp — memory is stale after this point and must not be injected into context. */
  validUntil?: string;
  supersededById?: string;
  trustEvidenceSource?: string;
}

export interface AgentReputationScore {
  agentId: string;
  role: Role;
  modelIdentifier: string;
  tasksCompleted: number;
  firstPassVerifications: number;
  failedVerifications: number;
  defectInjectionCount: number;
  reliabilityScore: number; // 0.0 - 1.0
  totalTokensUsed: number;
  averageDurationSeconds: number;
}

export interface DistilledRule {
  id: string;
  sourceMemoryCodes: string[];
  ruleStatement: string;
  targetRole: Role;
  enforcementAction: "CONTEXT_PACK_INJECTION" | "LINTER_GUARDRAIL" | "PRE_COMMIT_HOOK";
  weight: number;
  createdAt: string;
}

export interface SelfHealingGuardrail {
  id: string;
  incidentCode: string;
  syntheticTestCaseCode: string;
  suggestedLinterRule: string;
  status: "ACTIVE" | "PENDING_REVIEW";
}
