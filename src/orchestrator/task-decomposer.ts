/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Task Decomposer & Work Graph Synthesis Engine (Section 15)
 */

import { ArchitectureBlueprint } from "../blueprint/types.js";
import { DesignContract } from "../design/types.js";
import { OrchestratorTask } from "./types.js";

export class TaskDecomposer {
  /**
   * Decomposes architecture blueprints and design contracts into atomic executable tasks
   */
  public decomposeBlueprint(
    blueprint: ArchitectureBlueprint,
    designContract?: DesignContract
  ): OrchestratorTask[] {
    const tasks: OrchestratorTask[] = [];
    const dbTaskIds: string[] = [];
    const apiTaskIds: string[] = [];

    // 1. Database Schema & Migration Tasks
    for (const schema of blueprint.databaseSchemas) {
      const taskId = `task-db-${schema.tableName}`;
      dbTaskIds.push(taskId);

      tasks.push({
        id: taskId,
        code: `TASK-DB-${schema.tableName.toUpperCase()}`,
        title: `Generate & Apply Migration for ${schema.tableName}`,
        description: `Create SQL migration and table structure for ${schema.tableName}.`,
        targetRole: "DATABASE_ENGINEER",
        status: "PENDING",
        priority: "HIGH",
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 2. Backend API Endpoint Implementation Tasks
    for (const api of blueprint.apiContracts) {
      const taskId = `task-api-${api.id}`;
      apiTaskIds.push(taskId);

      // API tasks depend on database schemas
      const relevantDb = dbTaskIds.find((dbId) => dbId.includes(api.boundedContext.toLowerCase()));
      const deps = relevantDb ? [relevantDb] : dbTaskIds.slice(0, 1);

      tasks.push({
        id: taskId,
        code: `TASK-API-${api.method}-${api.id.slice(-6).toUpperCase()}`,
        title: `Implement API: ${api.method} ${api.path}`,
        description: api.summary,
        targetRole: "BACKEND_SPECIALIST",
        status: "PENDING",
        priority: "HIGH",
        dependencies: deps,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 3. Frontend UI Screen Implementation Tasks
    const uiTaskIds: string[] = [];
    if (designContract) {
      for (const screen of designContract.screens) {
        const taskId = `task-ui-${screen.id}`;
        uiTaskIds.push(taskId);

        tasks.push({
          id: taskId,
          code: `TASK-UI-${screen.id.slice(-6).toUpperCase()}`,
          title: `Build Screen: ${screen.name}`,
          description: `Implement UI components, design tokens, and state machines for ${screen.name}.`,
          targetRole: "FRONTEND_SPECIALIST",
          status: "PENDING",
          priority: "MEDIUM",
          dependencies: apiTaskIds,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 4. Security & RBAC Audit Task
    const secTaskId = `task-sec-audit-${Date.now().toString().slice(-4)}`;
    tasks.push({
      id: secTaskId,
      code: "TASK-SEC-AUDIT",
      title: "Security Boundary & Token Revocation Audit",
      description: "Verify least-privilege token lifecycles and KMS key isolation.",
      targetRole: "SECURITY_ARCHITECT",
      status: "PENDING",
      priority: "CRITICAL",
      dependencies: apiTaskIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 5. Final QA & Acceptance Verification Task
    const qaTaskId = `task-qa-verify-${Date.now().toString().slice(-4)}`;
    tasks.push({
      id: qaTaskId,
      code: "TASK-QA-ACCEPTANCE",
      title: "End-to-End Acceptance & Evidence Verification",
      description: "Execute regression suite and generate cryptographically sealed proof artifact.",
      targetRole: "QA_ENGINEER",
      status: "PENDING",
      priority: "CRITICAL",
      dependencies: [...apiTaskIds, ...uiTaskIds, secTaskId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return tasks;
  }
}
