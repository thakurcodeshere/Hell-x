/**
 * Hell-x Tests: Engineering Constitution (Step 13)
 */
import { describe, it, expect } from "vitest";
import {
  EngineeringConstitution,
  IMMUTABLE_PRINCIPLES,
} from "../src/governance/engineering-constitution.js";

describe("EngineeringConstitution — Immutable Principles & Governance (Step 13)", () => {
  it("exposes exactly 10 immutable principles covering all fundamental laws", () => {
    const constitution = new EngineeringConstitution();
    const principles = constitution.getPrinciples();
    expect(principles.length).toBe(10);
    expect(constitution.getPrincipleById("CONST-P-001")).toBeDefined();
    expect(constitution.getPrincipleById("CONST-P-010")).toBeDefined();
  });

  it("attemptPrincipleModification throws and logs constitutional violation", () => {
    const constitution = new EngineeringConstitution();
    expect(() =>
      constitution.attemptPrincipleModification(
        "agent-rogue",
        "CONST-P-003",
        "Disable independent verification for emergency fix"
      )
    ).toThrow("[CONSTITUTIONAL VIOLATION]");

    const violations = constitution.getViolations();
    expect(violations.length).toBe(1);
    expect(violations[0].principleId).toBe("CONST-P-003");
    expect(violations[0].violatingActorId).toBe("agent-rogue");
    expect(violations[0].severity).toBe("CONSTITUTIONAL");
  });

  it("enactPolicy: requires human approval", () => {
    const constitution = new EngineeringConstitution();
    expect(() =>
      constitution.enactPolicy({
        id: "POL-AUTO-DEPLOY",
        title: "Autonomous Deploy Policy",
        statement: "Deploy without verification",
        version: 1,
        effectiveFrom: new Date().toISOString(),
        approvedByAgents: ["agent-1", "agent-2"],
        humanApproved: false, // Disallowed
      })
    ).toThrow("cannot be enacted without human approval");
  });

  it("enactPolicy: requires at least 2 agent approvers (multi-sig)", () => {
    const constitution = new EngineeringConstitution();
    expect(() =>
      constitution.enactPolicy({
        id: "POL-TIMEOUT-ADJUST",
        title: "Timeout Policy",
        statement: "Set gate timeout to 30s",
        version: 1,
        effectiveFrom: new Date().toISOString(),
        approvedByAgents: ["agent-1"], // Only 1 approver -> Disallowed
        humanApproved: true,
      })
    ).toThrow("requires at least 2 agent approvers");
  });

  it("enactPolicy: successfully enacts and supersedes old policy", () => {
    const constitution = new EngineeringConstitution();
    const p1 = constitution.enactPolicy({
      id: "POL-001",
      title: "Initial Gate Policy",
      statement: "Enforce standard verification",
      version: 1,
      effectiveFrom: new Date().toISOString(),
      approvedByAgents: ["agent-1", "agent-2"],
      humanApproved: true,
    });
    expect(constitution.getActivePolicy("POL-001")?.isActive).toBe(true);

    const p2 = constitution.enactPolicy({
      id: "POL-002",
      title: "Updated Gate Policy",
      statement: "Enforce high-assurance verification",
      version: 2,
      effectiveFrom: new Date().toISOString(),
      supersedes: "POL-001",
      approvedByAgents: ["agent-1", "agent-2", "agent-3"],
      humanApproved: true,
    });

    expect(constitution.getActivePolicy("POL-002")?.isActive).toBe(true);
    expect(constitution.getActivePolicy("POL-001")).toBeUndefined(); // Superseded and inactive
  });

  it("checkPolicyContradictsConstitution catches blatant constitutional violations", () => {
    const constitution = new EngineeringConstitution();
    const contradictions = constitution.checkPolicyContradictsConstitution(
      "In urgent cases, agents may self-review and secrets may be plaintext in logs."
    );
    expect(contradictions.length).toBe(2);
    expect(contradictions.some((c) => c.includes("CONST-P-003"))).toBe(true);
    expect(contradictions.some((c) => c.includes("CONST-P-006"))).toBe(true);
  });
});
