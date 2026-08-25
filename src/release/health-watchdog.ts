/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Telemetry Health Probes & SLI/SLO Watchdog Engine (Section 25)
 */

import { HealthMetrics, SLOThresholds } from "./types.js";

export const DEFAULT_SLO_THRESHOLDS: SLOThresholds = {
  maxErrorRate: 0.001, // 0.1% max error rate
  maxP99LatencyMs: 150, // 150ms P99 max latency
  maxCpuUtilization: 0.8, // 80% max CPU
  maxMemoryUtilization: 0.85, // 85% max Memory
};

export class HealthWatchdog {
  constructor(private thresholds: SLOThresholds = DEFAULT_SLO_THRESHOLDS) {}

  /**
   * Evaluates raw runtime telemetry against SLO thresholds
   */
  public evaluateHealth(raw: {
    totalRequests: number;
    errorCount: number;
    p50LatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
    cpuUtilization: number;
    memoryUtilization: number;
    http5xxCount: number;
  }): HealthMetrics {
    const errorRate = raw.totalRequests > 0 ? raw.errorCount / raw.totalRequests : 0.0;
    const violations: string[] = [];

    // 1. Error rate check
    if (errorRate > this.thresholds.maxErrorRate) {
      violations.push(
        `Error rate ${(errorRate * 100).toFixed(2)}% exceeds SLO threshold (${(this.thresholds.maxErrorRate * 100).toFixed(2)}%).`
      );
    }

    // 2. P99 Latency check
    if (raw.p99LatencyMs > this.thresholds.maxP99LatencyMs) {
      violations.push(
        `P99 latency ${raw.p99LatencyMs}ms exceeds SLA limit (${this.thresholds.maxP99LatencyMs}ms).`
      );
    }

    // 3. CPU utilization check
    if (raw.cpuUtilization > this.thresholds.maxCpuUtilization) {
      violations.push(
        `CPU utilization ${(raw.cpuUtilization * 100).toFixed(1)}% exceeds capacity threshold (${(this.thresholds.maxCpuUtilization * 100).toFixed(1)}%).`
      );
    }

    // 4. Memory utilization check
    if (raw.memoryUtilization > this.thresholds.maxMemoryUtilization) {
      violations.push(
        `Memory utilization ${(raw.memoryUtilization * 100).toFixed(1)}% exceeds threshold (${(this.thresholds.maxMemoryUtilization * 100).toFixed(1)}%).`
      );
    }

    const isHealthy = violations.length === 0;

    return {
      timestamp: new Date().toISOString(),
      errorRate: Number(errorRate.toFixed(4)),
      p50LatencyMs: raw.p50LatencyMs,
      p95LatencyMs: raw.p95LatencyMs,
      p99LatencyMs: raw.p99LatencyMs,
      cpuUtilization: raw.cpuUtilization,
      memoryUtilization: raw.memoryUtilization,
      http5xxCount: raw.http5xxCount,
      isHealthy,
      violations,
    };
  }
}
