import { describe, it, expect } from "vitest";
import { DAGEngine } from "../src/graph/dag-engine.js";
import { ImpactEngine } from "../src/graph/impact-engine.js";
import { HellxError } from "../src/core/errors.js";

describe("DAGEngine & ImpactEngine (Layer 05 & Section 28)", () => {
  it("builds DAG, prevents cyclic dependencies, and calculates parallel execution tiers", () => {
    const dag = new DAGEngine();

    dag.addNode({ id: "req-1", code: "REQ-001", type: "REQUIREMENT", title: "Auth" });
    dag.addNode({ id: "adr-1", code: "ADR-001", type: "ADR", title: "PostgreSQL" });
    dag.addNode({ id: "db-1", code: "schema-users", type: "DB_SCHEMA", title: "Users Table" });
    dag.addNode({ id: "api-1", code: "api-post-users", type: "API_CONTRACT", title: "Create User API" });
    dag.addNode({ id: "task-1", code: "TASK-001", type: "TASK_NODE", title: "Implement API" });

    // REQ-001 -> ADR-001 -> schema-users -> api-post-users -> TASK-001
    dag.addEdge({ id: "e1", sourceId: "req-1", targetId: "adr-1", type: "JUSTIFIES" });
    dag.addEdge({ id: "e2", sourceId: "adr-1", targetId: "db-1", type: "IMPLEMENTS" });
    dag.addEdge({ id: "e3", sourceId: "db-1", targetId: "api-1", type: "DEPENDS_ON" });
    dag.addEdge({ id: "e4", sourceId: "api-1", targetId: "task-1", type: "IMPLEMENTS" });

    expect(dag.hasCycle()).toBe(false);

    // Attempting cycle should be rejected
    expect(() => {
      dag.addEdge({ id: "e-cycle", sourceId: "task-1", targetId: "req-1", type: "DEPENDS_ON" });
    }).toThrow(HellxError);

    // Test parallel execution tiers
    const tiers = dag.getParallelExecutionTiers();
    expect(tiers.length).toBe(5);
    expect(tiers[0].parallelExecutableNodes[0].code).toBe("REQ-001");
    expect(tiers[4].parallelExecutableNodes[0].code).toBe("TASK-001");
  });

  it("calculates blast radius across downstream APIs and tables", () => {
    const dag = new DAGEngine();

    dag.addNode({ id: "req-1", code: "REQ-001", type: "REQUIREMENT", title: "Auth" });
    dag.addNode({ id: "db-1", code: "users_table", type: "DB_SCHEMA", title: "Users Table" });
    dag.addNode({ id: "api-1", code: "api-login", type: "API_CONTRACT", title: "Login API" });
    dag.addNode({ id: "api-2", code: "api-register", type: "API_CONTRACT", title: "Register API" });

    dag.addEdge({ id: "e1", sourceId: "req-1", targetId: "db-1", type: "IMPLEMENTS" });
    dag.addEdge({ id: "e2", sourceId: "db-1", targetId: "api-1", type: "DEPENDS_ON" });
    dag.addEdge({ id: "e3", sourceId: "db-1", targetId: "api-2", type: "DEPENDS_ON" });

    const impactEngine = new ImpactEngine(dag);
    const impact = impactEngine.analyzeImpact("req-1");

    expect(impact.affectedTables).toContain("users_table");
    expect(impact.affectedAPIs).toContain("api-login");
    expect(impact.affectedAPIs).toContain("api-register");
    expect(impact.transitiveBlastRadius.length).toBe(3);
    expect(impact.riskRating).toBe("CRITICAL");
  });
});
