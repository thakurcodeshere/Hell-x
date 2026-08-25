import { describe, it, expect } from "vitest";
import { FlakinessEngine } from "../src/verification/flakiness-engine.js";

describe("FlakinessEngine & Quarantine (Phase 5 / Section 20)", () => {
  it("detects non-deterministic test results and quarantines flaky tests", () => {
    const engine = new FlakinessEngine();

    // 1. Stable passing test (5 passes out of 5)
    const stable = engine.evaluateTestStability("tests/auth.test.ts", "test_jwt_login", [true, true, true, true, true]);
    expect(stable.isFlaky).toBe(false);
    expect(stable.passRate).toBe(1.0);

    // 2. Flaky test (3 passes, 2 fails)
    const flaky = engine.evaluateTestStability("tests/pay.test.ts", "test_concurrent_checkout", [true, false, true, true, false]);
    expect(flaky.isFlaky).toBe(true);
    expect(flaky.passRate).toBe(0.6);

    const quarantined = engine.getQuarantinedTests();
    expect(quarantined.length).toBe(1);
    expect(quarantined[0].testName).toBe("test_concurrent_checkout");

    const report = engine.generateReport(10);
    expect(report.flakyTestsDetected).toBe(1);
    expect(report.suiteStabilityScore).toBe(0.9);
  });
});
