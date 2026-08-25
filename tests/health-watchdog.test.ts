import { describe, it, expect } from "vitest";
import { HealthWatchdog } from "../src/release/health-watchdog.js";

describe("HealthWatchdog (Phase 6 / Section 25)", () => {
  const watchdog = new HealthWatchdog({
    maxErrorRate: 0.001, // 0.1%
    maxP99LatencyMs: 150,
    maxCpuUtilization: 0.8,
    maxMemoryUtilization: 0.85,
  });

  it("passes when all telemetry metrics are within SLO bounds", () => {
    const health = watchdog.evaluateHealth({
      totalRequests: 10000,
      errorCount: 2, // 0.02% < 0.1%
      p50LatencyMs: 25,
      p95LatencyMs: 80,
      p99LatencyMs: 120, // 120ms < 150ms
      cpuUtilization: 0.45,
      memoryUtilization: 0.55,
      http5xxCount: 2,
    });

    expect(health.isHealthy).toBe(true);
    expect(health.violations.length).toBe(0);
  });

  it("flags violation when error rate or P99 latency breaches SLO", () => {
    const health = watchdog.evaluateHealth({
      totalRequests: 1000,
      errorCount: 10, // 1.0% > 0.1%
      p50LatencyMs: 50,
      p95LatencyMs: 180,
      p99LatencyMs: 320, // 320ms > 150ms
      cpuUtilization: 0.9, // 90% > 80%
      memoryUtilization: 0.6,
      http5xxCount: 10,
    });

    expect(health.isHealthy).toBe(false);
    expect(health.violations.length).toBe(3); // Error rate, P99, CPU
  });
});
