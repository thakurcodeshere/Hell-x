/**
 * Hell-x Tests: Tool Permission Matrix (Step 11)
 */
import { describe, it, expect } from "vitest";
import {
  ToolPermissionMatrix,
  DEFAULT_PERMISSION_SETS,
} from "../src/sandbox/tool-permission-matrix.js";

describe("ToolPermissionMatrix — Per-Agent Tool Permissions (Step 11)", () => {
  it("enforces least privilege on registered roles", () => {
    const matrix = new ToolPermissionMatrix();
    matrix.registerAgent("agent-fe-01", "FRONTEND_SPECIALIST");
    matrix.registerAgent("agent-sre-01", "SRE");

    // Frontend has READ/WRITE/EXECUTE, but NOT DATABASE or DEPLOY
    expect(matrix.check("agent-fe-01", "READ").decision).toBe("GRANTED");
    expect(matrix.check("agent-fe-01", "DATABASE").decision).toBe("DENIED");
    expect(matrix.check("agent-fe-01", "DEPLOY").decision).toBe("DENIED");

    // SRE has DEPLOY and DATABASE
    expect(matrix.check("agent-sre-01", "DEPLOY").decision).toBe("GRANTED");
    expect(matrix.check("agent-sre-01", "DATABASE").decision).toBe("GRANTED");
  });

  it("unregistered agents have zero permissions (fail-closed)", () => {
    const matrix = new ToolPermissionMatrix();
    const result = matrix.check("unknown-agent-999", "READ");
    expect(result.decision).toBe("DENIED");
    expect(result.reason).toContain("not registered");
  });

  it("assertPermission throws immediately on DENIED", () => {
    const matrix = new ToolPermissionMatrix();
    matrix.registerAgent("agent-fe-02", "FRONTEND_SPECIALIST");
    expect(() => matrix.assertPermission("agent-fe-02", "SECRET")).toThrow(
      "[PERMISSION DENIED]"
    );
  });

  it("GOVERN permission cannot be granted at registration time", () => {
    const matrix = new ToolPermissionMatrix();
    matrix.registerAgent("agent-rogue", "BACKEND_SPECIALIST", ["GOVERN"]);
    // GOVERN should have been stripped at registration
    expect(matrix.check("agent-rogue", "GOVERN").decision).toBe("DENIED");
  });

  it("grantAdditional: GOVERN permission requires human approval flag", () => {
    const matrix = new ToolPermissionMatrix();
    matrix.registerAgent("agent-admin", "SYSTEM_ARCHITECT");

    // Without human approval -> throws
    expect(() => matrix.grantAdditional("agent-admin", "GOVERN", false)).toThrow(
      "Human approval required"
    );

    // With human approval -> granted
    matrix.grantAdditional("agent-admin", "GOVERN", true);
    expect(matrix.check("agent-admin", "GOVERN").decision).toBe("GRANTED");
  });

  it("maintains full audit log of all checks including denied attempts", () => {
    const matrix = new ToolPermissionMatrix();
    matrix.registerAgent("agent-qa-01", "QA_ENGINEER");

    matrix.check("agent-qa-01", "READ");
    matrix.check("agent-qa-01", "SECRET"); // Denied
    matrix.check("ghost-agent", "EXECUTE"); // Denied

    expect(matrix.getAuditLog().length).toBe(3);
    const denied = matrix.getDeniedAttempts();
    expect(denied.length).toBe(2);
    expect(denied.map((d) => d.agentId)).toEqual(["agent-qa-01", "ghost-agent"]);
  });

  it("supports permission restrictions (e.g. DEPLOY staging only)", () => {
    const matrix = new ToolPermissionMatrix();
    matrix.registerAgent("agent-dev-01", "BACKEND_SPECIALIST", ["DEPLOY"], {
      DEPLOY: "staging-environment-only",
    });

    const check = matrix.check("agent-dev-01", "DEPLOY");
    expect(check.decision).toBe("GRANTED");
    expect(check.reason).toContain("staging-environment-only");
  });
});
