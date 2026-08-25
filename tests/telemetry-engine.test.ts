import { describe, it, expect } from "vitest";
import { TelemetryEngine } from "../src/observability/telemetry-engine.js";

describe("TelemetryEngine (Phase 7 / Section 29)", () => {
  it("starts and ends distributed trace spans and detects metric anomalies", () => {
    const telemetry = new TelemetryEngine();

    const parentSpan = telemetry.startSpan("http_request", { path: "/v1/charges" });
    const childSpan = telemetry.startSpan("db_query", { table: "charges" }, parentSpan.id);

    telemetry.endSpan(childSpan.id, "OK");
    telemetry.endSpan(parentSpan.id, "OK");

    expect(parentSpan.durationMs).toBeDefined();
    expect(childSpan.traceId).toBe(parentSpan.traceId);
    expect(telemetry.getAllMetrics().length).toBe(2);

    // Test metric anomaly detection
    const alert = telemetry.checkMetricAnomaly("p99_latency", 450, 150, 0.5); // 200% deviation > 50%
    expect(alert).toBeDefined();
    expect(alert?.severity).toBe("CRITICAL");
    expect(alert?.deviationSigma).toBe(2.0);
  });
});
