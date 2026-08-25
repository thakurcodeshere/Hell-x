/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 4: Task Graph & Orchestrator Types
 */

import { Role } from "../core/types.js";
import { ContextPack } from "../workforce/context-pack.js";

export type TaskLifecycleStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "VERIFIED"
  | "FAILED"
  | "MERGED";

export interface OrchestratorTask {
  id: string;
  code: string;
  title: string;
  description: string;
  targetRole: Role;
  status: TaskLifecycleStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dependencies: string[]; // Task IDs that must finish before this task
  assignedWorkerId?: string;
  contextPack?: ContextPack;
  worktreePath?: string;
  branchName?: string;
  submission?: WorkerSubmission;
  verification?: VerificationResult;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerSubmission {
  taskId: string;
  workerId: string;
  workerRole: Role;
  gitCommitHash: string;
  changedFiles: string[];
  testOutputSummary: string;
  submittedAt: string;
}

export interface VerificationResult {
  taskId: string;
  verifierId: string;
  verifierRole: Role;
  status: "PASSED" | "REJECTED";
  testsPassed: boolean;
  securityAuditPassed: boolean;
  evidenceId: string;
  evidenceHash: string;
  reviewNotes: string;
  verifiedAt: string;
}

export interface TaskTierBatch {
  tierIndex: number;
  tasks: OrchestratorTask[];
}
