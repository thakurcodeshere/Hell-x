/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Observability & Telemetry Engine (Section 29)
 */

import { TelemetrySpan, MetricDatapoint, LogEntry, AnomalyAlert } from "./types.js";
import crypto from "crypto";

export class TelemetryEngine {
  private spans: Map<string, TelemetrySpan> = new Map();
  private metrics: MetricDatapoint[] = [];
  private logs: LogEntry[] = [];
  private alerts: AnomalyAlert[] = [];

  /**
   * Starts a distributed trace span
   */
  public startSpan(name: string, attributes: Record<string, any> = {}, parentId?: string): TelemetrySpan {
    const spanId = `span-${crypto.randomBytes(6).toString("hex")}`;
    const traceId = parentId ? this.spans.get(parentId)?.traceId || `trace-${crypto.randomBytes(8).toString("hex")}` : `trace-${crypto.randomBytes(8).toString("hex")}`;

    const span: TelemetrySpan = {
      id: spanId,
      traceId,
      parentId,
      name,
      kind: "SERVER",
      startTime: Date.now(),
      status: "OK",
      attributes,
      events: [],
    };

    this.spans.set(spanId, span);
    return span;
  }

  /**
   * Completes a span and computes execution duration
   */
  public endSpan(spanId: string, status: "OK" | "ERROR" = "OK"): TelemetrySpan | undefined {
    const span = this.spans.get(spanId);
    if (!span) return undefined;

    span.endTime = Date.now();
    span.durationMs = span.endTime - span.startTime;
    span.status = status;

    // Record latency metric automatically
    this.recordMetric({
      name: `${span.name}.duration`,
      value: span.durationMs,
      unit: "ms",
      timestamp: new Date().toISOString(),
      tags: { status, traceId: span.traceId },
    });

    return span;
  }

  public recordMetric(metric: MetricDatapoint): void {
    this.metrics.push(metric);
  }

  public recordLog(level: LogEntry["level"], message: string, context: Record<string, any> = {}, traceId?: string): LogEntry {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${this.logs.length + 1}`,
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      traceId,
    };
    this.logs.push(entry);
    return entry;
  }

  /**
   * Analyzes metrics for runtime anomalies against baselines
   */
  public checkMetricAnomaly(
    metricName: string,
    observedValue: number,
    baselineValue: number,
    maxAllowedDeviationPercent: number = 0.5
  ): AnomalyAlert | undefined {
    const diff = Math.abs(observedValue - baselineValue);
    const deviation = baselineValue > 0 ? diff / baselineValue : 0;

    if (deviation > maxAllowedDeviationPercent) {
      const alert: AnomalyAlert = {
        id: `alert-${Date.now()}-${this.alerts.length + 1}`,
        metricName,
        baselineValue,
        observedValue,
        deviationSigma: Number(deviation.toFixed(2)),
        severity: deviation > 1.0 ? "CRITICAL" : "WARNING",
        detectedAt: new Date().toISOString(),
        description: `Metric '${metricName}' observed value ${observedValue} deviated ${(deviation * 100).toFixed(0)}% from baseline (${baselineValue}).`,
      };
      this.alerts.push(alert);
      return alert;
    }

    return undefined;
  }

  public getAllSpans(): TelemetrySpan[] {
    return Array.from(this.spans.values());
  }

  public getAllMetrics(): MetricDatapoint[] {
    return this.metrics;
  }

  public getAllLogs(): LogEntry[] {
    return this.logs;
  }

  public getAllAlerts(): AnomalyAlert[] {
    return this.alerts;
  }
}
