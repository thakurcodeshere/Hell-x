/**
 * Hell-x Tests: Invariant Engine (Step 06)
 * Verifies all 7 canonical system invariants are correctly enforced.
 */
import { describe, it, expect } from "vitest";
import { InvariantEngine, SYSTEM_INVARIANTS } from "../src/governance/invariant-engine.js";

describe("InvariantEngine — Formal System Invariants (Step 06)", () => {
  const engine = new InvariantEngine();

  it("AGENT-INV-001: blocks self-review at VERIFICATION_GATE", () => {
    const result = engine.evaluate("VERIFICATION_GATE", {
      builderAgentId: "agent-001",
      verifierAgentId: "agent-001",  // same — violation
    });
    const violation = result.violations.find((v) => v.invariantId === "AGENT-INV-001");
    expect(result.passed).toBe(false);
    expect(violation).toBeDefined();
    expect(violation?.severity).toBe("CRITICAL");
  });

  it("AGENT-INV-001: passes when builder != verifier", () => {
    const result = engine.evaluate("VERIFICATION_GATE", {
      builderAgentId: "agent-001",
      verifierAgentId: "agent-002",
      evidenceCount: 1,
      evidenceLevel: "E1_MACHINE",
      riskScore: 0.3,
    });
    const violation = result.violations.find((v) => v.invariantId === "AGENT-INV-001");
    expect(violation).toBeUndefined();
  });

  it("AUTH-INV-001: blocks high-risk release without human approval", () => {
    const result = engine.evaluate("RELEASE_GATE", {
      riskScore: 0.75,
      humanApprovalPresent: false,
      gatesClearedCount: 6,
      totalRequiredGates: 6,
    });
    const violation = result.violations.find((v) => v.invariantId === "AUTH-INV-001");
    expect(violation).toBeDefined();
    expect(violation?.severity).toBe("CRITICAL");
  });

  it("AUTH-INV-001: passes for high-risk release WITH human approval", () => {
    const result = engine.evaluate("RELEASE_GATE", {
      riskScore: 0.75,
      humanApprovalPresent: true,
      gatesClearedCount: 6,
      totalRequiredGates: 6,
    });
    const violation = result.violations.find((v) => v.invariantId === "AUTH-INV-001");
    expect(violation).toBeUndefined();
  });

  it("SEC-INV-001: blocks when secrets are in agent context", () => {
    const result = engine.evaluate("EXECUTION_GATE", {
      secretsInContext: true,
    });
    const violation = result.violations.find((v) => v.invariantId === "SEC-INV-001");
    expect(violation).toBeDefined();
    expect(violation?.severity).toBe("CRITICAL");
  });

  it("ARCH-INV-001: blocks frontend direct database access", () => {
    const result = engine.evaluate("EXECUTION_GATE", {
      frontendAccessingDb: true,
    });
    const violation = result.violations.find((v) => v.invariantId === "ARCH-INV-001");
    expect(violation).toBeDefined();
  });

  it("DATA-INV-001: blocks E0_ASSERTION evidence for high-risk task", () => {
    const result = engine.evaluate("VERIFICATION_GATE", {
      builderAgentId: "agent-A",
      verifierAgentId: "agent-B",
      riskScore: 0.65,
      evidenceLevel: "E0_ASSERTION",
      evidenceCount: 1,
    });
    const violation = result.violations.find((v) => v.invariantId === "DATA-INV-001");
    expect(violation).toBeDefined();
  });

  it("OPS-INV-001: blocks verification gate with zero evidence", () => {
    const result = engine.evaluate("VERIFICATION_GATE", {
      builderAgentId: "agent-A",
      verifierAgentId: "agent-B",
      evidenceCount: 0,
      riskScore: 0.3,
    });
    const violation = result.violations.find((v) => v.invariantId === "OPS-INV-001");
    expect(violation).toBeDefined();
  });

  it("DEPLOY-INV-001: blocks release when gates not fully cleared", () => {
    const result = engine.evaluate("RELEASE_GATE", {
      gatesClearedCount: 4,
      totalRequiredGates: 6,
      riskScore: 0.2,
      humanApprovalPresent: false,
    });
    const violation = result.violations.find((v) => v.invariantId === "DEPLOY-INV-001");
    expect(violation).toBeDefined();
  });

  it("assertNoCriticalViolation throws on CRITICAL violation", () => {
    expect(() =>
      engine.assertNoCriticalViolation("VERIFICATION_GATE", {
        builderAgentId: "same-agent",
        verifierAgentId: "same-agent",
        secretsInContext: false,
        evidenceCount: 0,
      })
    ).toThrow("INVARIANT VIOLATION (CRITICAL)");
  });

  it("lists all 7 canonical invariants", () => {
    expect(engine.listInvariants().length).toBe(7);
  });
});
