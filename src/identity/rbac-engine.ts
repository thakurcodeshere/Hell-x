/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Enterprise Multi-Tenant RBAC & Governance Engine
 */

import { OrganizationTenant, UserIdentity, Permission, EnterpriseRole } from "./types.js";
import { HellxError } from "../core/errors.js";

export const DEFAULT_ROLE_PERMISSIONS: Record<EnterpriseRole, Permission[]> = {
  PLATFORM_ADMIN: [
    "GATE_APPROVE_SPEC",
    "GATE_APPROVE_ARCH",
    "GATE_APPROVE_DESIGN",
    "GATE_APPROVE_EXEC",
    "GATE_APPROVE_VERIF",
    "GATE_APPROVE_RELEASE",
    "RELEASE_PROD_DEPLOY",
    "EMERGENCY_ROLLBACK",
    "MEMORY_WRITE",
    "POLICY_UPDATE",
  ],
  SECURITY_OFFICER: [
    "GATE_APPROVE_ARCH",
    "GATE_APPROVE_VERIF",
    "GATE_APPROVE_RELEASE",
    "EMERGENCY_ROLLBACK",
    "POLICY_UPDATE",
  ],
  TECH_LEAD: [
    "GATE_APPROVE_SPEC",
    "GATE_APPROVE_ARCH",
    "GATE_APPROVE_DESIGN",
    "GATE_APPROVE_EXEC",
    "GATE_APPROVE_VERIF",
    "GATE_APPROVE_RELEASE",
    "RELEASE_PROD_DEPLOY",
    "MEMORY_WRITE",
  ],
  RELEASE_MANAGER: [
    "GATE_APPROVE_VERIF",
    "GATE_APPROVE_RELEASE",
    "RELEASE_PROD_DEPLOY",
    "EMERGENCY_ROLLBACK",
  ],
  DEVELOPER_AGENT: [
    "MEMORY_WRITE",
  ],
  AUDITOR: [],
};

export class RBACEngine {
  private tenants: Map<string, OrganizationTenant> = new Map();
  private users: Map<string, UserIdentity> = new Map();

  public registerTenant(tenant: OrganizationTenant): void {
    this.tenants.set(tenant.id, tenant);
  }

  public registerUser(user: UserIdentity): void {
    if (!this.tenants.has(user.tenantId)) {
      throw new HellxError(`Cannot register user to non-existent tenant '${user.tenantId}'`, "INVALID_TENANT");
    }
    this.users.set(user.id, user);
  }

  public hasPermission(userId: string, permission: Permission): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    // Check user-level permissions
    if (user.permissions.includes(permission)) return true;

    // Check role default permissions
    const rolePerms = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
    return rolePerms.includes(permission);
  }

  public enforceTenantBoundary(userId: string, targetTenantId: string): void {
    const user = this.users.get(userId);
    if (!user) {
      throw new HellxError(`Unauthenticated actor '${userId}'`, "UNAUTHENTICATED");
    }
    if (user.tenantId !== targetTenantId && user.role !== "PLATFORM_ADMIN") {
      throw new HellxError(
        `Cross-tenant access violation: user '${userId}' from tenant '${user.tenantId}' attempted access to '${targetTenantId}'`,
        "TENANT_ISOLATION_VIOLATION"
      );
    }
  }

  public getTenant(tenantId: string): OrganizationTenant | undefined {
    return this.tenants.get(tenantId);
  }
}
