/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Production Telemetry, Product Analytics & Experimentation Types
 */

export interface TelemetrySpanRecord {
  traceId: string;
  spanId: string;
  serviceName: string;
  endpoint: string;
  httpStatus: number;
  durationMs: number;
  hasError: boolean;
  timestamp: string;
}

export interface REDMetricsSummary {
  requestRateRps: number;
  errorRatePercent: number;
  p50LatencyMs: number;
  p90LatencyMs: number;
  p99LatencyMs: number;
  totalRequestsSampled: number;
}

export interface ProductFunnelStep {
  stepIndex: number;
  stepName: string;
  visitorsCount: number;
  conversionFromPreviousPercent: number;
  dropOffPercent: number;
}

export interface ProductAnalyticsSummary {
  funnelName: string;
  totalVisitors: number;
  steps: ProductFunnelStep[];
  overallConversionRatePercent: number;
}

export interface ABExperimentConfig {
  experimentId: string;
  name: string;
  metricTarget: string; // e.g. "checkout_conversion"
  baselineVariant: string; // "control-v1"
  challengerVariant: string; // "experiment-redis-prefetch-v2"
  trafficSplitPercent: number; // e.g. 50 (50/50 split)
  minimumSampleSize: number;
}

export interface ABExperimentResult {
  experimentId: string;
  baselineSampleCount: number;
  baselineConversionRate: number;
  challengerSampleCount: number;
  challengerConversionRate: number;
  relativeUpliftPercent: number;
  pValue: number; // Statistical significance
  isStatisticallySignificant: boolean; // pValue < 0.01
  winningVariant: string;
  recommendation: "PROMOTE_TO_100" | "CONTINUE_EXPERIMENT" | "ROLLBACK_CHALLENGER";
}
