/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Enterprise Identity, Multi-Tenancy & Multi-Sig RBAC Types
 */

export type EnterpriseRole =
  | "PLATFORM_ADMIN"
  | "SECURITY_OFFICER"
  | "TECH_LEAD"
  | "RELEASE_MANAGER"
  | "DEVELOPER_AGENT"
  | "AUDITOR";

export type Permission =
  | "GATE_APPROVE_SPEC"
  | "GATE_APPROVE_ARCH"
  | "GATE_APPROVE_DESIGN"
  | "GATE_APPROVE_EXEC"
  | "GATE_APPROVE_VERIF"
  | "GATE_APPROVE_RELEASE"
  | "RELEASE_PROD_DEPLOY"
  | "EMERGENCY_ROLLBACK"
  | "MEMORY_WRITE"
  | "POLICY_UPDATE";

export interface OrganizationTenant {
  id: string;
  name: string;
  slug: string;
  allowedModels: string[];
  maxDailySpendUsd: number;
  enforceMultiSigReleases: boolean;
  createdAt: string;
}

export interface UserIdentity {
  id: string;
  name: string;
  tenantId: string;
  role: EnterpriseRole;
  isHuman: boolean;
  publicKey?: string;
  permissions: Permission[];
}

export interface MultiSigApprovalToken {
  releaseId: string;
  gateCode: string;
  approverId: string;
  approverRole: EnterpriseRole;
  approverIsHuman: boolean;
  digitalSignature: string;
  approvedAt: string;
  justification: string;
}
