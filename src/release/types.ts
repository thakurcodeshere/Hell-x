/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 6: Release Engine & Deployment State Machine Types
 */

import { Role } from "../core/types.js";
import { MemoryArtifact } from "../core/artifacts.js";

export type DeploymentStrategy = "CANARY" | "BLUE_GREEN" | "SHADOW" | "ROLLING";

export type DeploymentState =
  | "PENDING_GATE"
  | "GATE_APPROVED"
  | "PRE_FLIGHT_CHECK"
  | "CANARY_10_PERCENT"
  | "CANARY_25_PERCENT"
  | "CANARY_50_PERCENT"
  | "FULL_PROMOTION"
  | "OBSERVABILITY_BAKEOFF"
  | "COMPLETED"
  | "ROLLING_BACK"
  | "ROLLED_BACK"
  | "DEPLOYMENT_FAILED";

export interface SLOThresholds {
  maxErrorRate: number; // e.g. 0.001 (0.1%)
  maxP99LatencyMs: number; // e.g. 150ms
  maxCpuUtilization: number; // e.g. 0.80 (80%)
  maxMemoryUtilization: number; // e.g. 0.85 (85%)
}

export interface HealthMetrics {
  timestamp: string;
  errorRate: number; // 0.0 - 1.0
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  cpuUtilization: number;
  memoryUtilization: number;
  http5xxCount: number;
  isHealthy: boolean;
  violations: string[];
}

export interface RollbackPlan {
  id: string;
  targetVersion: string;
  previousStableCommitHash: string;
  migrationDownSql?: string;
  trafficReversionTarget: "BLUE" | "GREEN" | "PREVIOUS_STABLE";
  estimatedRollbackTimeSeconds: number;
}

export interface DeploymentPlan {
  id: string;
  releaseVersion: string;
  targetEnvironment: "STAGING" | "PRODUCTION";
  strategy: DeploymentStrategy;
  targetCommitHash: string;
  sloThresholds: SLOThresholds;
  rollbackPlan: RollbackPlan;
  authorId: string;
  authorRole: Role;
  createdAt: string;
}

export interface DeploymentStatusRecord {
  id: string;
  planId: string;
  currentState: DeploymentState;
  trafficPercentage: number;
  activeCanaryStage: number;
  healthMetricsHistory: HealthMetrics[];
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface PostMortemReport {
  id: string;
  deploymentId: string;
  failedState: DeploymentState;
  triggeringMetric: string;
  rootCauseSummary: string;
  rollbackDurationMs: number;
  remediationActionTaken: string;
  memoryArtifact: MemoryArtifact;
  generatedAt: string;
}
