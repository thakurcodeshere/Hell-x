/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * System Invariant Engine — Step 06
 *
 * Enforces machine-executable invariants that no agent can violate,
 * regardless of task context or model output.
 *
 * External Authority:
 *   OWASP Top 10 A01:2021 (AUTH), A02:2021 (DATA), A03:2021 (SEC)
 *   NIST SP 800-53 (AC, SC, SI, AU)
 *   Hell-x Law 05 (Agent Boundaries), Law 06 (Zero Self-Review), Law 09 (Human Invariant)
 */

export type InvariantCategory = "AUTH" | "DATA" | "SEC" | "ARCH" | "AGENT" | "DEPLOY" | "OPS";
export type InvariantSeverity = "CRITICAL" | "HIGH" | "MEDIUM";
export type GateType = "EXECUTION_GATE" | "VERIFICATION_GATE" | "RELEASE_GATE" | "ARCHITECTURE_GATE";

export interface InvariantContext {
  actorId?: string;
  builderAgentId?: string;
  verifierAgentId?: string;
  targetPath?: string;
  riskScore?: number;
  humanApprovalPresent?: boolean;
  secretsInContext?: boolean;
  frontendAccessingDb?: boolean;
  evidenceCount?: number;
  evidenceLevel?: "E0_ASSERTION" | "E1_MACHINE" | "E2_INDEPENDENT_REALITY";
  gatesClearedCount?: number;
  totalRequiredGates?: number;
}

export interface InvariantViolation {
  invariantId: string;
  category: InvariantCategory;
  severity: InvariantSeverity;
  rule: string;
  detail: string;
  blockedAt: GateType;
  timestamp: string;
}

export interface InvariantCheckResult {
  passed: boolean;
  violations: InvariantViolation[];
  checkedAt: string;
  invariantsEvaluated: number;
}

export interface SystemInvariant {
  id: string;
  category: InvariantCategory;
  rule: string;
  externalAuthority: string;       // cite external standard
  severity: InvariantSeverity;
  enforcedAt: GateType[];
  evaluator: (ctx: InvariantContext) => boolean;
  violationMessage: (ctx: InvariantContext) => string;
}

/**
 * The canonical set of system invariants.
 * These are IMMUTABLE — agents cannot modify them.
 * Changes require a governance PR with dual-approver sign-off.
 */
export const SYSTEM_INVARIANTS: readonly SystemInvariant[] = Object.freeze([
  {
    id: "AGENT-INV-001",
    category: "AGENT",
    rule: "An agent that built an artifact cannot independently verify the same artifact.",
    externalAuthority: "Hell-x Law 06: Zero Self-Review; NIST SP 800-53 AU-9",
    severity: "CRITICAL",
    enforcedAt: ["EXECUTION_GATE", "VERIFICATION_GATE"],
    evaluator: (ctx) => !ctx.builderAgentId || !ctx.verifierAgentId || ctx.builderAgentId !== ctx.verifierAgentId,
    violationMessage: (ctx) =>
      `Self-review detected: builderAgentId (${ctx.builderAgentId}) === verifierAgentId (${ctx.verifierAgentId}). Independent verifier required.`,
  },
  {
    id: "AUTH-INV-001",
    category: "AUTH",
    rule: "No high-risk task (riskScore ≥ 0.6) may be released without human approval.",
    externalAuthority: "Hell-x Law 09: Human Invariant; NIST SP 800-53 AC-6",
    severity: "CRITICAL",
    enforcedAt: ["RELEASE_GATE"],
    evaluator: (ctx) => (ctx.riskScore ?? 0) < 0.6 || ctx.humanApprovalPresent === true,
    violationMessage: (ctx) =>
      `High-risk deployment (riskScore=${ctx.riskScore}) requires human approval. humanApprovalPresent=${ctx.humanApprovalPresent}.`,
  },
  {
    id: "SEC-INV-001",
    category: "SEC",
    rule: "Production secrets must never enter agent context as plaintext.",
    externalAuthority: "OWASP A02:2021 Cryptographic Failures; NIST SP 800-53 SC-12",
    severity: "CRITICAL",
    enforcedAt: ["EXECUTION_GATE", "VERIFICATION_GATE", "RELEASE_GATE"],
    evaluator: (ctx) => ctx.secretsInContext !== true,
    violationMessage: () =>
      `Secret exfiltration invariant violated: production credentials detected in agent context. Execution blocked.`,
  },
  {
    id: "ARCH-INV-001",
    category: "ARCH",
    rule: "Frontend agents cannot directly access production database resources.",
    externalAuthority: "OWASP A01:2021 Broken Access Control; Hell-x Law 05: Agent Boundaries",
    severity: "HIGH",
    enforcedAt: ["ARCHITECTURE_GATE", "EXECUTION_GATE"],
    evaluator: (ctx) => ctx.frontendAccessingDb !== true,
    violationMessage: () =>
      `Architecture boundary violation: frontend attempting direct database access. Route through API layer.`,
  },
  {
    id: "DATA-INV-001",
    category: "DATA",
    rule: "CRITICAL releases require at least E1_MACHINE evidence level — agent assertions alone are insufficient.",
    externalAuthority: "Hell-x Law 07: Evidentiary Proof; NIST SP 800-53 SI-7",
    severity: "HIGH",
    enforcedAt: ["VERIFICATION_GATE", "RELEASE_GATE"],
    evaluator: (ctx) => {
      if ((ctx.riskScore ?? 0) >= 0.5) {
        return ctx.evidenceLevel === "E1_MACHINE" || ctx.evidenceLevel === "E2_INDEPENDENT_REALITY";
      }
      return true;
    },
    violationMessage: (ctx) =>
      `Evidence level insufficient for riskScore=${ctx.riskScore}. Got ${ctx.evidenceLevel}, required E1_MACHINE or higher.`,
  },
  {
    id: "DEPLOY-INV-001",
    category: "DEPLOY",
    rule: "Production deployment requires all mandatory governance gates to be cleared.",
    externalAuthority: "SLSA v1.0 Build L3; Hell-x Law 08: Risk-Adaptive Depth",
    severity: "CRITICAL",
    enforcedAt: ["RELEASE_GATE"],
    evaluator: (ctx) => {
      const cleared = ctx.gatesClearedCount ?? 0;
      const required = ctx.totalRequiredGates ?? 6;
      return cleared >= required;
    },
    violationMessage: (ctx) =>
      `Release gate blocked: only ${ctx.gatesClearedCount}/${ctx.totalRequiredGates} required governance gates cleared.`,
  },
  {
    id: "OPS-INV-001",
    category: "OPS",
    rule: "Evidence must exist (evidenceCount > 0) before any gate can approve a task.",
    externalAuthority: "Hell-x Law 07: Claims require reproducible, cryptographic evidence",
    severity: "CRITICAL",
    enforcedAt: ["VERIFICATION_GATE"],
    evaluator: (ctx) => (ctx.evidenceCount ?? 0) > 0,
    violationMessage: () =>
      `Zero evidence submitted. Verification gate requires at least one machine-generated evidence artifact (CLAIM ≠ PROOF).`,
  },
]);

/**
 * InvariantEngine — evaluates all applicable invariants at a given gate.
 * Fail-closed by default: any CRITICAL violation immediately blocks progression.
 */
export class InvariantEngine {
  private readonly invariants: readonly SystemInvariant[];

  constructor(invariants: readonly SystemInvariant[] = SYSTEM_INVARIANTS) {
    this.invariants = invariants;
  }

  /**
   * Evaluate all invariants applicable to the given gate context.
   * Returns a result with pass/fail and full violation details.
   */
  public evaluate(gate: GateType, context: InvariantContext): InvariantCheckResult {
    const applicable = this.invariants.filter((inv) => inv.enforcedAt.includes(gate));
    const violations: InvariantViolation[] = [];

    for (const invariant of applicable) {
      const passes = invariant.evaluator(context);
      if (!passes) {
        violations.push({
          invariantId: invariant.id,
          category: invariant.category,
          severity: invariant.severity,
          rule: invariant.rule,
          detail: invariant.violationMessage(context),
          blockedAt: gate,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return {
      passed: violations.length === 0,
      violations,
      checkedAt: new Date().toISOString(),
      invariantsEvaluated: applicable.length,
    };
  }

  /**
   * Asserts that no CRITICAL invariant is violated at the given gate.
   * Throws immediately on any CRITICAL violation (fail-closed).
   */
  public assertNoCriticalViolation(gate: GateType, context: InvariantContext): void {
    const result = this.evaluate(gate, context);
    const criticals = result.violations.filter((v) => v.severity === "CRITICAL");
    if (criticals.length > 0) {
      const msg = criticals.map((v) => `[${v.invariantId}] ${v.detail}`).join("\n");
      throw new Error(`INVARIANT VIOLATION (CRITICAL) at ${gate}:\n${msg}`);
    }
  }

  public listInvariants(): readonly SystemInvariant[] {
    return this.invariants;
  }
}
