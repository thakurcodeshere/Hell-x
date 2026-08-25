/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 7: Observability & Runtime Intelligence Types (Section 29)
 */

export type SpanKind = "INTERNAL" | "SERVER" | "CLIENT" | "PRODUCER" | "CONSUMER";

export interface TelemetrySpan {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  kind: SpanKind;
  startTime: number; // Unix epoch ms
  endTime?: number;
  durationMs?: number;
  status: "OK" | "ERROR";
  attributes: Record<string, any>;
  events: { name: string; timestamp: number; attributes?: Record<string, any> }[];
}

export interface MetricDatapoint {
  name: string;
  value: number;
  unit: "ms" | "count" | "percent" | "bytes" | "tps";
  timestamp: string;
  tags: Record<string, string>;
}

export interface LogEntry {
  id: string;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";
  message: string;
  timestamp: string;
  context: Record<string, any>;
  traceId?: string;
  spanId?: string;
}

export interface AnomalyAlert {
  id: string;
  metricName: string;
  baselineValue: number;
  observedValue: number;
  deviationSigma: number;
  severity: "WARNING" | "CRITICAL";
  detectedAt: string;
  description: string;
}
