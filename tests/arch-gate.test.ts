import { describe, it, expect } from "vitest";
import { ArchitectureGateEvaluator } from "../src/governance/arch-gate.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";
import { EventBus } from "../src/storage/event-bus.js";
import { ArchitectureBlueprint } from "../src/blueprint/types.js";

describe("ArchitectureGateEvaluator (Layer 09)", () => {
  it("approves blueprint when all components are traceable and security model is defined", async () => {
    const store = new ArtifactStore();
    await store.initialize();
    const bus = new EventBus();
    await bus.initialize();

    const blueprint: ArchitectureBlueprint = {
      id: "blue-01",
      projectId: "proj-01",
      version: 1,
      boundedContexts: ["PAYMENT"],
      entities: [
        {
          id: "ent-1",
          name: "Payment",
          boundedContext: "PAYMENT",
          description: "Payment entity",
          fields: [{ name: "id", type: "UUID", required: true, isPrimary: true, description: "ID" }],
          invariants: [],
          relationships: [],
          traceRequirementCodes: ["REQ-PAYM-001"],
        },
      ],
      adrs: [],
      apiContracts: [
        {
          id: "api-1",
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
          id: "schema-1",
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
        rbacRoles: [{ roleName: "USER", allowedPermissions: ["payment:write"], deniedPermissions: [] }],
        secretIsolationPolicies: [],
        traceRequirementCodes: ["REQ-PAYM-001"],
      },
      traceRequirementCodes: ["REQ-PAYM-001"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const gate = new ArchitectureGateEvaluator(store, bus);
    const result = await gate.evaluateArchitectureReadiness({
      gateId: "gate-arch-001",
      blueprint,
      evaluatorActor: {
        id: "lead-architect",
        name: "Lead Architect",
        type: "SYSTEM_EVALUATOR",
        role: "SYSTEM_ARCHITECT",
        permissions: ["GATE_APPROVE"],
      },
      justification: "100% component-to-requirement traceability and complete security boundaries.",
    });

    expect(result.status).toBe("PASSED");
    expect(result.violations.length).toBe(0);
  });
});
