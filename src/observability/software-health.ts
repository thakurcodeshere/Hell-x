/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Digital Software Health Model & Degradation Sentinel (Section 41)
 * Multi-state software health state machine:
 * HEALTHY <-> WATCH <-> DEGRADING <-> AT_RISK <-> CRITICAL
 */

export type HealthState = "HEALTHY" | "WATCH" | "DEGRADING" | "AT_RISK" | "CRITICAL";

export interface TelemetryHealthMetrics {
  p99LatencyMs: number;
  errorRatePercent: number;
  cpuUtilizationPercent: number;
  memoryUtilizationPercent: number;
  dbReplicationLagMs: number;
  unresolvedIncidentsCount: number;
}

export interface SoftwareHealthStatus {
  currentState: HealthState;
  previousState: HealthState;
  healthIndexScore: number; // 0.0 - 1.0
  activeAnomalies: string[];
  recommendedActions: string[];
  lastEvaluatedAt: string;
}

export class SoftwareHealthModel {
  private currentState: HealthState = "HEALTHY";
  private previousState: HealthState = "HEALTHY";

  public evaluateHealth(metrics: TelemetryHealthMetrics): SoftwareHealthStatus {
    this.previousState = this.currentState;
    const anomalies: string[] = [];
    const recommendations: string[] = [];

    // Evaluate Anomalies
    if (metrics.unresolvedIncidentsCount > 0) {
      anomalies.push(`Critical: ${metrics.unresolvedIncidentsCount} unresolved active incidents.`);
      recommendations.push("Trigger Autonomous Self-Healing RCA Swarm immediately.");
    }
    if (metrics.errorRatePercent > 1.0) {
      anomalies.push(`Error Rate Breach: ${metrics.errorRatePercent}% errors exceeds 1% critical threshold.`);
      recommendations.push("Initiate sub-second Fast-Rollback Sentinel.");
    } else if (metrics.errorRatePercent > 0.05) {
      anomalies.push(`Elevated Error Rate: ${metrics.errorRatePercent}% errors.`);
      recommendations.push("Pause canary traffic promotion and inspect application logs.");
    }

    if (metrics.p99LatencyMs > 500) {
      anomalies.push(`P99 Latency Critical: ${metrics.p99LatencyMs}ms exceeds 500ms SLA.`);
      recommendations.push("Scale read replicas and check Redis cache hit ratio.");
    } else if (metrics.p99LatencyMs > 150) {
      anomalies.push(`P99 Latency Warning: ${metrics.p99LatencyMs}ms.`);
    }

    if (metrics.cpuUtilizationPercent > 90 || metrics.memoryUtilizationPercent > 90) {
      anomalies.push(`Resource Saturation: CPU ${metrics.cpuUtilizationPercent}%, Mem ${metrics.memoryUtilizationPercent}%.`);
      recommendations.push("Auto-scale horizontal microservice pods.");
    }

    // State Transition Logic
    if (metrics.unresolvedIncidentsCount > 0 || metrics.errorRatePercent > 1.0 || metrics.p99LatencyMs > 500) {
      this.currentState = "CRITICAL";
    } else if (metrics.errorRatePercent > 0.05 || metrics.p99LatencyMs > 200 || metrics.cpuUtilizationPercent > 85) {
      this.currentState = "AT_RISK";
    } else if (metrics.p99LatencyMs > 100 || metrics.dbReplicationLagMs > 200) {
      this.currentState = "DEGRADING";
    } else if (metrics.p99LatencyMs > 60) {
      this.currentState = "WATCH";
    } else {
      this.currentState = "HEALTHY";
    }

    let healthIndexScore = 1.0;
    if (this.currentState === "CRITICAL") healthIndexScore = 0.2;
    else if (this.currentState === "AT_RISK") healthIndexScore = 0.5;
    else if (this.currentState === "DEGRADING") healthIndexScore = 0.75;
    else if (this.currentState === "WATCH") healthIndexScore = 0.90;
    else healthIndexScore = 0.99;

    return {
      currentState: this.currentState,
      previousState: this.previousState,
      healthIndexScore,
      activeAnomalies: anomalies,
      recommendedActions: recommendations,
      lastEvaluatedAt: new Date().toISOString(),
    };
  }
}
