/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Task Dispatcher & Multi-Agent Parallel Scheduler (Section 15)
 */

import { OrchestratorTask, TaskTierBatch } from "./types.js";
import { WorktreeManager } from "../sandbox/worktree-manager.js";
import { EventBus } from "../storage/event-bus.js";
import { HellxError } from "../core/errors.js";

export class TaskDispatcher {
  private tasks: Map<string, OrchestratorTask> = new Map();

  constructor(
    private worktreeManager?: WorktreeManager,
    private eventBus?: EventBus
  ) {}

  public registerTasks(tasks: OrchestratorTask[]): void {
    for (const t of tasks) {
      this.tasks.set(t.id, t);
    }
  }

  public getTask(taskId: string): OrchestratorTask | undefined {
    return this.tasks.get(taskId);
  }

  public getAllTasks(): OrchestratorTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Identifies all tasks whose dependencies are fully satisfied and ready for execution
   */
  public getReadyTasks(): OrchestratorTask[] {
    const ready: OrchestratorTask[] = [];

    for (const task of this.tasks.values()) {
      if (task.status === "PENDING") {
        const allDepsMet = task.dependencies.every((depId) => {
          const dep = this.tasks.get(depId);
          return dep && (dep.status === "VERIFIED" || dep.status === "MERGED");
        });

        if (allDepsMet) {
          ready.push(task);
        }
      }
    }

    return ready;
  }

  /**
   * Partitions registered tasks into topological execution batches
   */
  public computeExecutionTiers(): TaskTierBatch[] {
    const batches: TaskTierBatch[] = [];
    const completed = new Set<string>();
    const remaining = new Map(this.tasks);

    let tierIndex = 0;
    while (remaining.size > 0) {
      const currentTierTasks: OrchestratorTask[] = [];

      for (const [id, task] of remaining.entries()) {
        const depsSatisfied = task.dependencies.every((depId) => completed.has(depId));
        if (depsSatisfied) {
          currentTierTasks.push(task);
        }
      }

      if (currentTierTasks.length === 0) {
        throw new HellxError("Circular or unresolvable task dependency detected in Task Graph.", "CYCLIC_TASK_GRAPH");
      }

      for (const t of currentTierTasks) {
        remaining.delete(t.id);
        completed.add(t.id);
      }

      batches.push({
        tierIndex: tierIndex++,
        tasks: currentTierTasks,
      });
    }

    return batches;
  }

  /**
   * Dispatches a task to a worker agent with an isolated branch
   */
  public async dispatchTask(
    taskId: string,
    workerId: string
  ): Promise<OrchestratorTask> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new HellxError(`Task '${taskId}' not found.`, "TASK_NOT_FOUND");
    }

    task.status = "IN_PROGRESS";
    task.assignedWorkerId = workerId;
    task.branchName = `feat/${task.code.toLowerCase()}`;
    task.updatedAt = new Date().toISOString();

    if (this.eventBus) {
      await this.eventBus.publish({
        id: `evt-dispatch-${task.id}-${Date.now()}`,
        type: "TASK_ASSIGNED",
        actorId: workerId,
        actorRole: task.targetRole,
        payload: {
          taskId: task.id,
          taskCode: task.code,
          role: task.targetRole,
          branchName: task.branchName,
        },
      });
    }

    return task;
  }

  /**
   * Records a worker's task submission
   */
  public async recordSubmission(params: {
    taskId: string;
    workerId: string;
    gitCommitHash: string;
    changedFiles: string[];
    testOutputSummary: string;
  }): Promise<OrchestratorTask> {
    const task = this.tasks.get(params.taskId);
    if (!task) throw new HellxError(`Task '${params.taskId}' not found.`, "TASK_NOT_FOUND");

    task.status = "SUBMITTED";
    task.submission = {
      taskId: task.id,
      workerId: params.workerId,
      workerRole: task.targetRole,
      gitCommitHash: params.gitCommitHash,
      changedFiles: params.changedFiles,
      testOutputSummary: params.testOutputSummary,
      submittedAt: new Date().toISOString(),
    };
    task.updatedAt = new Date().toISOString();

    return task;
  }
}
