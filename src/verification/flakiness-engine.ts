/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Flakiness Detector & Test Quarantine Engine (Section 20)
 */

import { FlakinessReport, QuarantinedTest } from "./types.js";

export class FlakinessEngine {
  private quarantinedTests: Map<string, QuarantinedTest> = new Map();

  /**
   * Runs an N-iteration stability evaluation on a test definition
   */
  public evaluateTestStability(
    testFile: string,
    testName: string,
    iterationResults: boolean[] // array of true (pass) / false (fail)
  ): { isFlaky: boolean; passRate: number } {
    const total = iterationResults.length;
    const passes = iterationResults.filter((r) => r).length;
    const fails = total - passes;
    const passRate = total > 0 ? passes / total : 1.0;

    // If test both passes AND fails across iterations, it is non-deterministic (flaky)
    const isFlaky = passes > 0 && fails > 0;

    if (isFlaky) {
      const key = `${testFile}::${testName}`;
      this.quarantinedTests.set(key, {
        testFile,
        testName,
        failCount: fails,
        passCount: passes,
        flakinessRate: Number((fails / total).toFixed(2)),
        quarantinedAt: new Date().toISOString(),
        reason: `Non-deterministic behavior: Passed ${passes}/${total} runs, Failed ${fails}/${total} runs.`,
      });
    }

    return {
      isFlaky,
      passRate,
    };
  }

  public getQuarantinedTests(): QuarantinedTest[] {
    return Array.from(this.quarantinedTests.values());
  }

  public generateReport(totalTestsEvaluated: number): FlakinessReport {
    const quarantined = this.getQuarantinedTests();
    const flakyCount = quarantined.length;
    const stability = totalTestsEvaluated > 0
      ? Number(Math.max(0.0, 1.0 - flakyCount / totalTestsEvaluated).toFixed(2))
      : 1.0;

    return {
      totalTestsEvaluated,
      flakyTestsDetected: flakyCount,
      quarantinedTests: quarantined,
      suiteStabilityScore: stability,
    };
  }
}
