import { describe, it, expect } from "vitest";
import { SPECIALIST_ROLES } from "../src/workforce/roles.js";
import { ContextPackEngine } from "../src/workforce/context-pack.js";
import { RequirementArtifact } from "../src/core/artifacts.js";

describe("SpecialistRoles & ContextPackEngine (Phase 4)", () => {
  it("defines explicit role permissions and quality checklists", () => {
    expect(SPECIALIST_ROLES.BACKEND_SPECIALIST.allowedPermissions).toContain("WRITE_SOURCE_CODE");
    expect(SPECIALIST_ROLES.BACKEND_SPECIALIST.forbiddenActions).toContain("APPROVE_OWN_TASK");
    expect(SPECIALIST_ROLES.QA_ENGINEER.forbiddenActions).toContain("APPROVE_OWN_WRITTEN_CODE");
  });

  it("generates precision context packs with bounded requirements and token estimates", () => {
    const contextEngine = new ContextPackEngine();
    const req: RequirementArtifact = {
      id: "req-1",
      type: "REQUIREMENT",
      code: "REQ-AUTH-001",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "pm-1",
      authorRole: "PRODUCT_MANAGER",
      title: "JWT Sign In",
      objective: "Authenticate users with JWT",
      actor: "User",
      trigger: "Login",
      preconditions: [],
      workflow: [],
      expectedResult: "Token",
      edgeCases: [],
      constraints: [],
      acceptanceCriteria: ["AC1: Sign in returns token"],
      verificationMethod: "Test",
      riskLevel: "HIGH",
      completenessRadar: {
        functional: 0.9,
        ux: 0.9,
        data: 0.9,
        security: 0.9,
        operational: 0.9,
        errorHandling: 0.9,
        compliance: 0.9,
        observability: 0.9,
      },
      explicitUnknowns: [],
      status: "VALIDATED",
      dependencies: [],
      tags: ["auth"],
      immutable: true,
    };

    const pack = contextEngine.generateContextPack({
      taskId: "task-01",
      taskTitle: "Implement JWT endpoint",
      assignedRole: "BACKEND_SPECIALIST",
      objective: "Build POST /v1/auth/login",
      constraints: ["Expiry 15 mins"],
      requirements: [req],
      targetFilePaths: ["src/routes/auth.ts"],
    });

    expect(pack.taskId).toBe("task-01");
    expect(pack.assignedRole).toBe("BACKEND_SPECIALIST");
    expect(pack.boundRequirements.length).toBe(1);
    expect(pack.estimatedTokens).toBeGreaterThan(50);
  });
});
