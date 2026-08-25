import { describe, it, expect } from "vitest";
import { APIGenerator } from "../src/blueprint/api-generator.js";
import { DataModeler } from "../src/blueprint/data-modeler.js";
import { DomainEntity } from "../src/blueprint/types.js";

describe("APIGenerator & DataModeler (Layer 04)", () => {
  const entity: DomainEntity = {
    id: "ent-1",
    name: "Subscription",
    boundedContext: "BILLING",
    description: "Recurring subscription plan entity",
    fields: [
      { name: "id", type: "UUID", required: true, isPrimary: true, description: "Subscription ID" },
      { name: "userId", type: "UUID", required: true, description: "User ID" },
      { name: "planCode", type: "STRING", required: true, isUnique: true, description: "Plan identifier" },
      { name: "monthlyPriceCents", type: "NUMBER", required: true, description: "Price" },
      { name: "createdAt", type: "DATETIME", required: true, description: "Created date" },
    ],
    invariants: ["Price cannot be negative."],
    relationships: [],
    traceRequirementCodes: ["REQ-SUB-001"],
  };

  it("generates REST API endpoint contracts from domain entities", () => {
    const apiGen = new APIGenerator();
    const contracts = apiGen.generateContracts([entity]);

    expect(contracts.length).toBe(3); // List, GetById, Create
    expect(contracts.some((c) => c.method === "POST" && c.path === "/v1/subscriptions")).toBe(true);
    expect(contracts.some((c) => c.method === "GET" && c.path === "/v1/subscriptions/{id}")).toBe(true);
  });

  it("generates SQL DDL tables and indexes from domain entities", () => {
    const dataModeler = new DataModeler();
    const schemas = dataModeler.generateSchemas([entity]);

    expect(schemas.length).toBe(1);
    expect(schemas[0].tableName).toBe("subscriptions");
    expect(schemas[0].ddlCreateStatement).toContain("CREATE TABLE IF NOT EXISTS subscriptions");
    expect(schemas[0].ddlCreateStatement).toContain("id UUID PRIMARY KEY");
    expect(schemas[0].indexes.length).toBe(1);
  });
});
