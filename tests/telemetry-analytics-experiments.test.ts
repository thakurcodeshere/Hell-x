import { describe, it, expect } from "vitest";
import { ProductionTelemetryEngine } from "../src/analytics/production-telemetry.js";
import { ProductAnalyticsEngine } from "../src/analytics/product-analytics.js";
import { ExperimentationEngine } from "../src/analytics/experimentation-engine.js";
import { EventBus } from "../src/storage/event-bus.js";

describe("Production Telemetry, Product Analytics & Experiments (Phase 15)", () => {
  it("aggregates RED metrics, evaluates product funnels, and calculates statistical A/B confidence", () => {
    // 1. Production Telemetry
    const bus = new EventBus();
    const telemetry = new ProductionTelemetryEngine(bus);

    telemetry.recordSpan({ serviceName: "billing-svc", endpoint: "/v1/charges", httpStatus: 200, durationMs: 42, hasError: false });
    telemetry.recordSpan({ serviceName: "billing-svc", endpoint: "/v1/charges", httpStatus: 200, durationMs: 38, hasError: false });
    telemetry.recordSpan({ serviceName: "billing-svc", endpoint: "/v1/charges", httpStatus: 200, durationMs: 51, hasError: false });

    const red = telemetry.getREDMetrics();
    expect(red.totalRequestsSampled).toBe(3);
    expect(red.errorRatePercent).toBe(0.0);
    expect(red.p99LatencyMs).toBeGreaterThan(0);

    // 2. Product Analytics Funnel
    const product = new ProductAnalyticsEngine();
    product.trackEvent({ userId: "u-1", eventName: "user_signup" });
    product.trackEvent({ userId: "u-1", eventName: "checkout_started" });
    product.trackEvent({ userId: "u-1", eventName: "payment_authorized" });
    product.trackEvent({ userId: "u-1", eventName: "invoice_generated" });

    const funnel = product.getFunnelSummary("Subscription Onboarding");
    expect(funnel.steps.length).toBe(4);
    expect(funnel.overallConversionRatePercent).toBeGreaterThan(0);

    // 3. A/B Experimentation Engine
    const expEngine = new ExperimentationEngine();
    const expResult = expEngine.evaluateExperiment(
      {
        experimentId: "exp-redis-prefetch-checkout",
        name: "Redis Prefetch on Checkout",
        metricTarget: "checkout_conversion",
        baselineVariant: "control-v1",
        challengerVariant: "challenger-redis-prefetch-v2",
        trafficSplitPercent: 50,
        minimumSampleSize: 500,
      },
      {
        baselineImpressions: 1000,
        baselineConversions: 120, // 12%
        challengerImpressions: 1000,
        challengerConversions: 180, // 18% (+50% relative uplift)
      }
    );

    expect(expResult.relativeUpliftPercent).toBe(50.0);
    expect(expResult.pValue).toBeLessThan(0.01);
    expect(expResult.isStatisticallySignificant).toBe(true);
    expect(expResult.winningVariant).toBe("challenger-redis-prefetch-v2");
    expect(expResult.recommendation).toBe("PROMOTE_TO_100");
  });
});
