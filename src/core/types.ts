/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Core Types & Primitives
 */

export type EntityId = string;

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskVector {
  businessImpact: number; // 0.0 - 1.0
  securitySurface: number;
  dataSensitivity: number;
  architecturalBlastRadius: number;
  changeComplexity: number;
  productionExposure: number;
  historicalDefectRate: number;
}

export interface CalculatedRisk {
  score: number; // 0.0 - 1.0
  level: RiskLevel;
  requiredProcessDepth: "FAST_LANE" | "STANDARD" | "HIGH_ASSURANCE";
  vectors: RiskVector;
  mandatesHumanApproval: boolean;
  mandatesIndependentVerifier: boolean;
  mandatesThreatModel: boolean;
}

export type AgentRole =
  | "PRODUCT_ANALYST"
  | "PRODUCT_MANAGER"
  | "SYSTEM_ARCHITECT"
  | "SECURITY_ARCHITECT"
  | "DATA_ARCHITECT"
  | "UX_DESIGNER"
  | "FRONTEND_ENGINEER"
  | "FRONTEND_SPECIALIST"
  | "BACKEND_ENGINEER"
  | "BACKEND_SPECIALIST"
  | "DATABASE_ENGINEER"
  | "INFRASTRUCTURE_ENGINEER"
  | "QA_ENGINEER"
  | "BROWSER_TESTER"
  | "SECURITY_TESTER"
  | "PERFORMANCE_ENGINEER"
  | "SRE"
  | "RELEASE_ENGINEER"
  | "RELEASE_AUTHORITY"
  | "GOVERNANCE_REVIEWER";

export type Role = AgentRole;

export interface Actor {
  id: EntityId;
  name: string;
  type: "HUMAN" | "AI_WORKER" | "SYSTEM_EVALUATOR";
  role: AgentRole;
  modelIdentifier?: string;
  permissions: string[];
}

export type ProjectState =
  | "INTENT"
  | "SPECIFICATION"
  | "ARCHITECTURE"
  | "DESIGN"
  | "ORCHESTRATION"
  | "EXECUTION"
  | "VERIFICATION"
  | "RELEASE"
  | "OBSERVING"
  | "CONTINUOUS_IMPROVEMENT";

export interface ProjectMetadata {
  id: EntityId;
  name: string;
  description: string;
  repositoryPath: string;
  currentState: ProjectState;
  createdAt: string;
  updatedAt: string;
  defaultBranch: string;
  riskPolicyVersion: string;
}

export interface WorkspaceConfig {
  projectRoot: string;
  worktreesDir: string;
  storageDir: string;
  artifactsDir: string;
  eventsLogPath: string;
}
