/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Deployment State Machine & Canary Progression Engine (Section 23 & 24)
 */

import { DeploymentPlan, DeploymentStatusRecord, DeploymentState, HealthMetrics } from "./types.js";
import { HealthWatchdog } from "./health-watchdog.js";
import { EventBus } from "../storage/event-bus.js";
import { HellxError } from "../core/errors.js";

export class DeploymentEngine {
  private activeDeployments: Map<string, DeploymentStatusRecord> = new Map();
  private watchdog: HealthWatchdog;

  constructor(
    private eventBus?: EventBus,
    watchdog?: HealthWatchdog
  ) {
    this.watchdog = watchdog || new HealthWatchdog();
  }

  public initializeDeployment(plan: DeploymentPlan): DeploymentStatusRecord {
    const record: DeploymentStatusRecord = {
      id: `deploy-${Date.now().toString().slice(-4)}`,
      planId: plan.id,
      currentState: "GATE_APPROVED",
      trafficPercentage: 0,
      activeCanaryStage: 0,
      healthMetricsHistory: [],
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.activeDeployments.set(record.id, record);
    return record;
  }

  public getDeployment(deploymentId: string): DeploymentStatusRecord | undefined {
    return this.activeDeployments.get(deploymentId);
  }

  /**
   * Transitions canary traffic stage if telemetry remains healthy
   */
  public async progressCanary(
    deploymentId: string,
    telemetry: {
      totalRequests: number;
      errorCount: number;
      p50LatencyMs: number;
      p95LatencyMs: number;
      p99LatencyMs: number;
      cpuUtilization: number;
      memoryUtilization: number;
      http5xxCount: number;
    }
  ): Promise<{ status: DeploymentStatusRecord; health: HealthMetrics }> {
    const deployment = this.activeDeployments.get(deploymentId);
    if (!deployment) {
      throw new HellxError(`Deployment '${deploymentId}' not found.`, "DEPLOYMENT_NOT_FOUND");
    }

    const health = this.watchdog.evaluateHealth(telemetry);
    deployment.healthMetricsHistory.push(health);
    deployment.updatedAt = new Date().toISOString();

    // Check health before progressing
    if (!health.isHealthy) {
      deployment.currentState = "ROLLING_BACK";
      deployment.failureReason = `Telemetry health probe failed: ${health.violations.join("; ")}`;
      return { status: deployment, health };
    }

    // Stepwise canary progression
    switch (deployment.currentState) {
      case "GATE_APPROVED":
      case "PRE_FLIGHT_CHECK":
        deployment.currentState = "CANARY_10_PERCENT";
        deployment.trafficPercentage = 10;
        deployment.activeCanaryStage = 1;
        break;
      case "CANARY_10_PERCENT":
        deployment.currentState = "CANARY_25_PERCENT";
        deployment.trafficPercentage = 25;
        deployment.activeCanaryStage = 2;
        break;
      case "CANARY_25_PERCENT":
        deployment.currentState = "CANARY_50_PERCENT";
        deployment.trafficPercentage = 50;
        deployment.activeCanaryStage = 3;
        break;
      case "CANARY_50_PERCENT":
        deployment.currentState = "FULL_PROMOTION";
        deployment.trafficPercentage = 100;
        deployment.activeCanaryStage = 4;
        break;
      case "FULL_PROMOTION":
        deployment.currentState = "COMPLETED";
        deployment.completedAt = new Date().toISOString();
        break;
      default:
        break;
    }

    if (this.eventBus) {
      await this.eventBus.publish({
        id: `evt-deploy-${deployment.id}-${Date.now()}`,
        type: deployment.currentState === "COMPLETED" ? "GATE_PASSED" : "TASK_STARTED",
        actorId: "agent-release-manager",
        actorRole: "RELEASE_ENGINEER",
        payload: {
          deploymentId: deployment.id,
          state: deployment.currentState,
          trafficPercentage: deployment.trafficPercentage,
          healthSummary: health.isHealthy ? "HEALTHY" : "DEGRADED",
        },
      });
    }

    return { status: deployment, health };
  }
}
