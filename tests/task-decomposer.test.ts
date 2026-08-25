import { describe, it, expect } from "vitest";
import { TaskDecomposer } from "../src/orchestrator/task-decomposer.js";
import { ArchitectureBlueprint } from "../src/blueprint/types.js";
import { DesignContract } from "../src/design/types.js";
import { DEFAULT_DESIGN_TOKENS } from "../src/design/token-engine.js";

describe("TaskDecomposer (Phase 4 / Section 15)", () => {
  const decomposer = new TaskDecomposer();

  it("decomposes blueprint and screens into atomic, role-assigned tasks", () => {
    const blueprint: ArchitectureBlueprint = {
      id: "b1",
      projectId: "p1",
      version: 1,
      boundedContexts: ["PAYMENT"],
      entities: [],
      adrs: [],
      apiContracts: [
        {
          id: "api-pay-01",
          method: "POST",
          path: "/v1/payments",
          summary: "Create payment",
          boundedContext: "PAYMENT",
          authRequired: true,
          requiredPermissions: ["payment:write"],
          parameters: [],
          responseSchemas: { 201: { type: "object" } },
          traceRequirementCodes: ["REQ-PAYM-001"],
        },
      ],
      databaseSchemas: [
        {
          id: "s1",
          tableName: "payments",
          columns: [{ name: "id", sqlType: "UUID", nullable: false, primaryKey: true }],
          indexes: [],
          ddlCreateStatement: "CREATE TABLE payments (id UUID PRIMARY KEY);",
          traceRequirementCodes: ["REQ-PAYM-001"],
        },
      ],
      securityModel: {
        id: "sec-1",
        authenticationMechanism: "JWT_BEARER",
        tokenTtlSeconds: 900,
        rbacRoles: [],
        secretIsolationPolicies: [],
        traceRequirementCodes: [],
      },
      traceRequirementCodes: ["REQ-PAYM-001"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const designContract: DesignContract = {
      id: "dc1",
      projectId: "p1",
      version: 1,
      tokens: DEFAULT_DESIGN_TOKENS,
      journeys: [],
      screens: [
        {
          id: "screen-pay",
          name: "PaymentScreen",
          routePath: "/pay",
          boundedContext: "PAYMENT",
          title: "Pay Screen",
          layout: "SINGLE_COLUMN",
          components: [],
          traceRequirementCodes: ["REQ-PAYM-001"],
          traceApiContractIds: ["api-pay-01"],
        },
      ],
      accessibilityScore: 1.0,
      traceRequirementCodes: ["REQ-PAYM-001"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tasks = decomposer.decomposeBlueprint(blueprint, designContract);

    expect(tasks.length).toBe(5);
    expect(tasks.some((t) => t.targetRole === "DATABASE_ENGINEER")).toBe(true);
    expect(tasks.some((t) => t.targetRole === "BACKEND_SPECIALIST")).toBe(true);
    expect(tasks.some((t) => t.targetRole === "FRONTEND_SPECIALIST")).toBe(true);
    expect(tasks.some((t) => t.targetRole === "SECURITY_ARCHITECT")).toBe(true);
    expect(tasks.some((t) => t.targetRole === "QA_ENGINEER")).toBe(true);
  });
});
