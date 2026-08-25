/**
 * Stryker configuration for Hell-x mutation testing (Step 04).
 * Targets the core governance, verification, and storage modules.
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
const config = {
  packageManager: "npm",
  testRunner: "vitest",
  vitest: {
    configFile: "vitest.config.ts",
  },
  mutate: [
    "src/governance/policy-engine.ts",
    "src/governance/invariant-engine.ts",
    "src/verification/evidence-levels.ts",
    "src/verification/claim-proof-ledger.ts",
    "src/storage/artifact-store.ts",
    "src/memory/memory-engine.ts",
    "src/orchestrator/peer-verifier.ts",
  ],
  // Exclude slow integration tests that require full OS init (>5s)
  // These are validated in the normal vitest suite — Stryker targets unit-speed tests
  testFiles: [
    "tests/invariant-engine.test.ts",
    "tests/evidence-levels.test.ts",
    "tests/memory-trust.test.ts",
    "tests/engineering-score-calibrated.test.ts",
    "tests/engineering-score.test.ts",
    "tests/evidence-collector.test.ts",
    "tests/claim-proof-ledger.test.ts",
    "tests/mutation-engine.test.ts",
    "tests/artifact-store.test.ts",
    "tests/governance.test.ts",
    "tests/peer-verifier.test.ts",
    "tests/policy-engine.test.ts",
  ],
  reporters: ["html", "clear-text"],
  htmlReporter: {
    fileName: "mutation-report/index.html",
  },
  coverageAnalysis: "perTest",
  thresholds: {
    high: 75,
    low: 60,
    break: 50,
  },
  timeoutMS: 60000,
  concurrency: 2,
};

export default config;

