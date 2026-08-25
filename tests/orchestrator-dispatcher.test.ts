import { describe, it, expect } from "vitest";
import { TaskDispatcher } from "../src/orchestrator/dispatcher.js";
import { OrchestratorTask } from "../src/orchestrator/types.js";

describe("TaskDispatcher (Phase 4 / Section 15)", () => {
  it("computes topological execution tiers and tracks ready tasks", async () => {
    const dispatcher = new TaskDispatcher();

    const t1: OrchestratorTask = {
      id: "t1",
      code: "TASK-DB",
      title: "DB Migration",
      description: "DB",
      targetRole: "DATABASE_ENGINEER",
      status: "PENDING",
      priority: "HIGH",
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const t2: OrchestratorTask = {
      id: "t2",
      code: "TASK-API",
      title: "API Endpoint",
      description: "API",
      targetRole: "BACKEND_SPECIALIST",
      status: "PENDING",
      priority: "HIGH",
      dependencies: ["t1"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatcher.registerTasks([t1, t2]);

    const tiers = dispatcher.computeExecutionTiers();
    expect(tiers.length).toBe(2);
    expect(tiers[0].tasks[0].id).toBe("t1");
    expect(tiers[1].tasks[0].id).toBe("t2");

    // Initially only t1 is ready
    const readyInitially = dispatcher.getReadyTasks();
    expect(readyInitially.length).toBe(1);
    expect(readyInitially[0].id).toBe("t1");

    // Dispatch t1
    await dispatcher.dispatchTask("t1", "worker-db-01");
    expect(dispatcher.getTask("t1")?.status).toBe("IN_PROGRESS");
  });
});
