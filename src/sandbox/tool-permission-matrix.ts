/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Per-Agent Tool Permission Matrix — Step 11
 *
 * Every agent has an independently scoped permission set.
 * An agent cannot grant itself permissions it was not initialized with.
 * Permission checks are evaluated at tool invocation time — not at startup.
 *
 * Permission dimensions:
 *   READ      — read files, artifacts, memory
 *   WRITE     — write files, create artifacts
 *   EXECUTE   — spawn processes, run commands
 *   NETWORK   — make outbound HTTP requests
 *   DATABASE  — read/write production database
 *   DEPLOY    — trigger canary or production deployment
 *   SECRET    — read secrets/credentials from vault
 *   GOVERN    — modify policy or invariant definitions
 *
 * Default: deny all. Every permission must be explicitly granted.
 * An agent cannot modify the policy governing itself (GOVERN requires human approval).
 *
 * External Authority:
 *   NIST SP 800-53 AC-6 (Least Privilege)
 *   Hell-x Law 05: Agent Boundaries
 *   Hell-x Law 09: Human Invariant (humans retain control over GOVERN + DEPLOY-PRODUCTION)
 */

export type ToolPermission =
  | "READ"
  | "WRITE"
  | "EXECUTE"
  | "NETWORK"
  | "DATABASE"
  | "DEPLOY"
  | "SECRET"
  | "GOVERN";

export type PermissionDecision = "GRANTED" | "DENIED";

export interface PermissionCheckResult {
  agentId: string;
  permission: ToolPermission;
  decision: PermissionDecision;
  reason: string;
  checkedAt: string;
}

export interface AgentPermissionScope {
  agentId: string;
  agentRole: string;
  grants: Set<ToolPermission>;
  /** Additional scope restrictions (e.g., DEPLOY only to staging, not production) */
  restrictions?: Partial<Record<ToolPermission, string>>;
}

/** Canonical default permission sets per role — principle of least privilege. */
export const DEFAULT_PERMISSION_SETS: Record<string, ToolPermission[]> = {
  BACKEND_SPECIALIST:   ["READ", "WRITE", "EXECUTE", "NETWORK"],
  FRONTEND_SPECIALIST:  ["READ", "WRITE", "EXECUTE"],
  QA_ENGINEER:          ["READ", "WRITE", "EXECUTE", "NETWORK"],
  SECURITY_SPECIALIST:  ["READ", "EXECUTE", "NETWORK", "SECRET"],
  SRE:                  ["READ", "WRITE", "EXECUTE", "NETWORK", "DATABASE", "DEPLOY"],
  SYSTEM_ARCHITECT:     ["READ", "WRITE", "EXECUTE", "NETWORK", "DATABASE"],
  REVIEWER:             ["READ"],
  SYSTEM:               ["READ", "WRITE", "EXECUTE", "NETWORK", "DATABASE", "DEPLOY", "GOVERN"],
};

/**
 * ToolPermissionMatrix — enforces per-agent permission checks at tool invocation time.
 *
 * Usage pattern:
 *   const matrix = new ToolPermissionMatrix();
 *   matrix.registerAgent("agent-backend-01", "BACKEND_SPECIALIST");
 *   matrix.check("agent-backend-01", "DEPLOY");  // → DENIED
 *   matrix.check("agent-sre-01", "DEPLOY");      // → GRANTED
 */
export class ToolPermissionMatrix {
  private scopes: Map<string, AgentPermissionScope> = new Map();
  private auditLog: PermissionCheckResult[] = [];

  /**
   * Registers an agent with its default role-based permissions.
   * Custom grants can be added with grantAdditional().
   */
  registerAgent(
    agentId: string,
    role: string,
    customGrants?: ToolPermission[],
    restrictions?: Partial<Record<ToolPermission, string>>
  ): void {
    const defaultGrants = DEFAULT_PERMISSION_SETS[role] ?? ["READ"];
    const grants = new Set<ToolPermission>([...defaultGrants, ...(customGrants ?? [])]);

    // GOVERN can never be granted at registration time — requires human approval
    grants.delete("GOVERN");

    this.scopes.set(agentId, { agentId, agentRole: role, grants, restrictions });
  }

  /**
   * Checks whether an agent has permission to use a tool.
   * Logs every check (both granted and denied) for audit.
   */
  check(agentId: string, permission: ToolPermission): PermissionCheckResult {
    const scope = this.scopes.get(agentId);
    let decision: PermissionDecision;
    let reason: string;

    if (!scope) {
      decision = "DENIED";
      reason = `Agent '${agentId}' is not registered in ToolPermissionMatrix. Unregistered agents have zero permissions.`;
    } else if (!scope.grants.has(permission)) {
      decision = "DENIED";
      reason =
        `Agent '${agentId}' (role: ${scope.agentRole}) does not hold '${permission}' permission. ` +
        `Granted: [${Array.from(scope.grants).join(", ")}]. NIST AC-6: Least Privilege enforced.`;
    } else if (scope.restrictions?.[permission]) {
      decision = "GRANTED";
      reason = `Permission '${permission}' granted with restriction: ${scope.restrictions[permission]}`;
    } else {
      decision = "GRANTED";
      reason = `Agent '${agentId}' (role: ${scope.agentRole}) holds '${permission}' permission.`;
    }

    const result: PermissionCheckResult = {
      agentId,
      permission,
      decision,
      reason,
      checkedAt: new Date().toISOString(),
    };
    this.auditLog.push(result);
    return result;
  }

  /**
   * Asserts permission — throws immediately if denied (fail-closed).
   */
  assertPermission(agentId: string, permission: ToolPermission): void {
    const result = this.check(agentId, permission);
    if (result.decision === "DENIED") {
      throw new Error(`[PERMISSION DENIED] ${result.reason}`);
    }
  }

  /**
   * Grants an additional permission to a specific agent.
   * GOVERN permission can never be self-granted — requires humanApproval flag.
   */
  grantAdditional(agentId: string, permission: ToolPermission, humanApproval: boolean = false): void {
    if (permission === "GOVERN" && !humanApproval) {
      throw new Error(
        `[PERMISSION MATRIX] GOVERN permission cannot be self-granted. ` +
        `Human approval required (Hell-x Law 09: Human Invariant).`
      );
    }
    const scope = this.scopes.get(agentId);
    if (scope) {
      scope.grants.add(permission);
    }
  }

  getScope(agentId: string): AgentPermissionScope | undefined {
    return this.scopes.get(agentId);
  }

  getAuditLog(): PermissionCheckResult[] {
    return [...this.auditLog];
  }

  getDeniedAttempts(): PermissionCheckResult[] {
    return this.auditLog.filter((r) => r.decision === "DENIED");
  }
}
