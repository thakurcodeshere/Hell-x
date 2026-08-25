/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 7: Memory & Continuous Learning Types (Section 30 - 34)
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

export interface MemoryRecord {
  id: string;
  code: string;
  category: MemoryCategory;
  summary: string;
  lessonLearned: string;
  preventativeRule?: string;
  applicableContext: string[];
  reinforcementScore: number; // Defaults to 1.0, increases with recurrence
  accessCount: number;
  lastReinforcedAt: string;
  createdAt: string;
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
