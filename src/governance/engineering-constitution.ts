/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Engineering Constitution — Step 13
 *
 * The Constitution is the topmost layer of the Hell-x governance stack.
 * It consists of two parts:
 *
 *   IMMUTABLE PRINCIPLES (Constitution Core):
 *     These cannot be changed by any agent, including system agents.
 *     They can only be changed via a governance PR with dual human approval.
 *     Violating them is a constitutional violation — the strongest error class.
 *
 *   MUTABLE POLICIES (Constitution Bylaws):
 *     These can be updated by governance process (policy-engine.ts).
 *     They must not contradict any immutable principle.
 *     Every change is versioned, signed, and auditable.
 *
 * Separation:
 *   PRINCIPLES  ← never touched by agents
 *   POLICIES    ← updated by governance process (humans + multi-sig)
 *   INVARIANTS  ← enforced at gate time (invariant-engine.ts)
 *   PERMISSIONS ← enforced at tool invocation (tool-permission-matrix.ts)
 *
 * External Authority:
 *   US Constitution structural analogy (immutable Bill of Rights + amendable legislation)
 *   Hell-x Law 01-15 (the complete Law corpus is the Immutable Core)
 *   NIST SP 800-53 PL-1 (Security and Privacy Policies, Plans, and Procedures)
 */

export interface ConstitutionalPrinciple {
  id: string;           // e.g., "CONST-P-001"
  lawNumber: number;    // 1–15 referencing Hell-x Laws
  statement: string;
  externalAuthority: string;
  /** True if this principle has ever been violated in simulation — for learning. */
  violationRecorded: boolean;
}

export interface ConstitutionalPolicy {
  id: string;           // e.g., "CONST-POL-002"
  title: string;
  statement: string;
  version: number;
  effectiveFrom: string;
  supersedes?: string;  // previous policy ID
  approvedByAgents: string[];   // multi-sig approvers
  humanApproved: boolean;
  isActive: boolean;
}

export interface ConstitutionViolation {
  principleId: string;
  violatingActorId: string;
  attemptDescription: string;
  blockedAt: string;
  severity: "CONSTITUTIONAL"; // always CONSTITUTIONAL — there is no lower
}

/**
 * The immutable core of the Engineering Constitution.
 * These cannot be modified at runtime. Any attempt to do so is a constitutional violation.
 */
export const IMMUTABLE_PRINCIPLES: readonly ConstitutionalPrinciple[] = Object.freeze([
  {
    id: "CONST-P-001",
    lawNumber: 1,
    statement: "Every engineering action begins with explicit, complete requirements. No code without a requirement.",
    externalAuthority: "IEEE 29148:2018 Requirements Engineering",
    violationRecorded: false,
  },
  {
    id: "CONST-P-002",
    lawNumber: 2,
    statement: "Every engineering change has a risk score. Risk score determines process depth. This is non-negotiable.",
    externalAuthority: "NIST SP 800-53 RA-3 (Risk Assessment)",
    violationRecorded: false,
  },
  {
    id: "CONST-P-003",
    lawNumber: 3,
    statement: "No agent is the sole authority over its own output. Independent verification is mandatory.",
    externalAuthority: "NIST SP 800-53 AU-9; Hell-x Law 06",
    violationRecorded: false,
  },
  {
    id: "CONST-P-004",
    lawNumber: 4,
    statement: "Claims require proof. Evidence must be independently reproducible. Assertions without evidence are rejected.",
    externalAuthority: "Hell-x Law 07: Evidentiary Proof; Karl Popper's falsifiability principle",
    violationRecorded: false,
  },
  {
    id: "CONST-P-005",
    lawNumber: 5,
    statement: "Agent boundaries are enforced. Frontend cannot access database directly. Each agent operates within its defined scope.",
    externalAuthority: "OWASP A01:2021 Broken Access Control; NIST AC-6 Least Privilege",
    violationRecorded: false,
  },
  {
    id: "CONST-P-006",
    lawNumber: 6,
    statement: "No production secrets enter agent context as plaintext. Secret exfiltration is a constitutional violation.",
    externalAuthority: "OWASP A02:2021 Cryptographic Failures; NIST SC-12",
    violationRecorded: false,
  },
  {
    id: "CONST-P-007",
    lawNumber: 7,
    statement: "Humans retain final authority over CRITICAL and FATAL deployments. No autonomous action on irreversible high-risk operations.",
    externalAuthority: "Hell-x Law 09: Human Invariant; EU AI Act Article 14 (Human Oversight)",
    violationRecorded: false,
  },
  {
    id: "CONST-P-008",
    lawNumber: 8,
    statement: "All engineering failures are recorded as memory. Learning is mandatory, not optional.",
    externalAuthority: "Hell-x Law 11: Failure Memory; ISO/IEC 25010 Maintainability",
    violationRecorded: false,
  },
  {
    id: "CONST-P-009",
    lawNumber: 9,
    statement: "Agent performance metrics are empirical (measured outcomes) not self-reported. Reputation is earned, not claimed.",
    externalAuthority: "Hell-x Law 13: Meritocratic Reputation",
    violationRecorded: false,
  },
  {
    id: "CONST-P-010",
    lawNumber: 10,
    statement: "The Engineering Constitution cannot be modified by any agent at runtime. Changes require dual human approval and a governance PR.",
    externalAuthority: "Hell-x Law 15: Constitutional Immutability",
    violationRecorded: false,
  },
]);

/**
 * EngineeringConstitution — enforces the separation between immutable principles
 * and mutable policies, and detects any attempt to modify principles at runtime.
 */
export class EngineeringConstitution {
  private policies: Map<string, ConstitutionalPolicy> = new Map();
  private violations: ConstitutionViolation[] = [];

  getPrinciples(): readonly ConstitutionalPrinciple[] {
    return IMMUTABLE_PRINCIPLES;
  }

  getPrincipleById(id: string): ConstitutionalPrinciple | undefined {
    return IMMUTABLE_PRINCIPLES.find((p) => p.id === id);
  }

  /**
   * Attempt to modify an immutable principle at runtime.
   * Always throws — this is a constitutional violation.
   */
  attemptPrincipleModification(actorId: string, principleId: string, description: string): never {
    const violation: ConstitutionViolation = {
      principleId,
      violatingActorId: actorId,
      attemptDescription: description,
      blockedAt: new Date().toISOString(),
      severity: "CONSTITUTIONAL",
    };
    this.violations.push(violation);
    throw new Error(
      `[CONSTITUTIONAL VIOLATION] Agent '${actorId}' attempted to modify immutable principle '${principleId}'. ` +
      `Description: ${description}. ` +
      `The Engineering Constitution cannot be modified at runtime (CONST-P-010).`
    );
  }

  /**
   * Registers a new mutable policy via governance process.
   * Requires multi-sig agent approval AND human approval for activation.
   */
  enactPolicy(policy: Omit<ConstitutionalPolicy, "isActive"> & { isActive?: boolean }): ConstitutionalPolicy {
    if (!policy.humanApproved) {
      throw new Error(
        `[CONSTITUTION] Policy '${policy.id}' cannot be enacted without human approval. ` +
        `Hell-x Law 09: Human Invariant requires human sign-off on governance changes.`
      );
    }
    if (policy.approvedByAgents.length < 2) {
      throw new Error(
        `[CONSTITUTION] Policy '${policy.id}' requires at least 2 agent approvers (multi-sig). ` +
        `Only ${policy.approvedByAgents.length} provided.`
      );
    }

    // Deactivate superseded policy
    if (policy.supersedes) {
      const old = this.policies.get(policy.supersedes);
      if (old) old.isActive = false;
    }

    const enacted: ConstitutionalPolicy = { ...policy, isActive: true };
    this.policies.set(enacted.id, enacted);
    return enacted;
  }

  getActivePolicy(id: string): ConstitutionalPolicy | undefined {
    const p = this.policies.get(id);
    return p?.isActive ? p : undefined;
  }

  getAllActivePolicies(): ConstitutionalPolicy[] {
    return Array.from(this.policies.values()).filter((p) => p.isActive);
  }

  getViolations(): ConstitutionViolation[] {
    return [...this.violations];
  }

  /**
   * Verifies that a proposed policy does not contradict any immutable principle.
   * Returns a list of contradictions found (empty = no contradictions).
   */
  checkPolicyContradictsConstitution(policyStatement: string): string[] {
    const contradictions: string[] = [];
    const lower = policyStatement.toLowerCase();

    // Simple heuristic checks for obvious contradictions
    if (lower.includes("agents may self-review") || lower.includes("self-verification allowed")) {
      contradictions.push("CONST-P-003: No agent is the sole authority over its own output.");
    }
    if (lower.includes("no evidence required") || lower.includes("evidence optional")) {
      contradictions.push("CONST-P-004: Claims require proof.");
    }
    if (lower.includes("secrets may be plaintext") || lower.includes("credentials in context")) {
      contradictions.push("CONST-P-006: No production secrets in agent context.");
    }
    if (lower.includes("autonomous deployment on critical") || lower.includes("no human approval needed for fatal")) {
      contradictions.push("CONST-P-007: Humans retain authority over CRITICAL and FATAL deployments.");
    }
    if (lower.includes("constitution may be modified") || lower.includes("principles are mutable")) {
      contradictions.push("CONST-P-010: The Engineering Constitution cannot be modified at runtime.");
    }

    return contradictions;
  }
}
