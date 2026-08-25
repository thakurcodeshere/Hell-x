/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Benchmark Disambiguation Card — Step 03
 *
 * PURPOSE: Every Hell-x performance metric must cite:
 *   1. What was measured (exact definition)
 *   2. What was NOT measured (scope exclusions)
 *   3. The environment it was measured in
 *   4. Whether it is simulation-scope or production-scope
 *
 * This file is the canonical reference for all Hell-x performance claims.
 * Any README, report, or dashboard citing a metric MUST reference this card.
 */

export type MetricScope =
  | "SIMULATION_IN_MEMORY"   // in-process objects, no real infra, no real time
  | "UNIT_TEST_HARNESS"      // vitest run on developer machine
  | "INTEGRATION_TEST"       // real process spawned, controlled environment
  | "STAGING_ENVIRONMENT"    // real infrastructure, synthetic traffic
  | "PRODUCTION_VERIFIED";   // verified against real production traffic and incidents

export interface BenchmarkMetricCard {
  metricId: string;
  displayName: string;
  claimedValue: string;

  /** Exact definition of what the number measures. */
  exactDefinition: string;

  /** What is explicitly NOT measured by this number. */
  scopeExclusions: string[];

  /** The environment in which the measurement was taken. */
  measurementScope: MetricScope;

  /** True only if an independent third party has verified this measurement. */
  independentlyVerified: boolean;

  /** Steps required before this metric can be upgraded to PRODUCTION_VERIFIED. */
  upgradeRequirements: string[];

  externalBenchmarkReference?: string;
}

/**
 * The canonical Hell-x Benchmark Disambiguation Card.
 * All current measurements are SIMULATION_IN_MEMORY or UNIT_TEST_HARNESS.
 */
export const HELL_X_BENCHMARK_CARD: readonly BenchmarkMetricCard[] = Object.freeze([
  {
    metricId: "MTTR-001",
    displayName: "Self-Healing MTTR",
    claimedValue: "~11ms",
    exactDefinition:
      "Time elapsed (Date.now() delta) between incident object creation and the final line of " +
      "remediateIncident() returning — all in-process, no network, no real file I/O.",
    scopeExclusions: [
      "DOES NOT include: real incident detection time (monitoring pipeline latency)",
      "DOES NOT include: real RCA (log ingestion, trace analysis)",
      "DOES NOT include: real patch synthesis (LLM call latency)",
      "DOES NOT include: real CI pipeline execution (build, test, scan)",
      "DOES NOT include: real canary promotion and traffic shifting",
      "DOES NOT include: real rollback if canary fails",
    ],
    measurementScope: "SIMULATION_IN_MEMORY",
    independentlyVerified: false,
    upgradeRequirements: [
      "Step 08: Deploy tiered autonomy engine to a staging environment",
      "Step 15: Inject real synthetic incidents into staging and measure wall-clock MTTD + MTTR-Fix",
      "Step 16: Have an independent observer reproduce the measurement on a fresh environment",
    ],
    externalBenchmarkReference: "Google SRE Handbook — Chapter 13: Emergency Response",
  },
  {
    metricId: "MUTATION-001",
    displayName: "Mutation Kill Rate",
    claimedValue: "88%",
    exactDefinition:
      "The MutationEngine.runMutationTests() method returns a hardcoded 88% value " +
      "to simulate the expected outcome of real mutation testing. No actual AST mutations " +
      "are injected into Hell-x's own source code.",
    scopeExclusions: [
      "DOES NOT include: real AST mutation injection (e.g. Stryker.js)",
      "DOES NOT include: actual test detection of real code mutations",
      "DOES NOT include: measurement of Hell-x's own test suite effectiveness",
    ],
    measurementScope: "SIMULATION_IN_MEMORY",
    independentlyVerified: false,
    upgradeRequirements: [
      "Step 04: Install Stryker.js and run against Hell-x src/",
      "Replace hardcoded return value with live Stryker report output",
      "Publish measured kill rate in README with Stryker badge",
    ],
    externalBenchmarkReference: "NIST SP 800-53 SA-11(8) — Mutation Testing",
  },
  {
    metricId: "SCORE-001",
    displayName: "Engineering Score",
    claimedValue: "100/100 A+ (previous claim — now retired)",
    exactDefinition:
      "The EngineeringScoreEngine defines its own dimension weights and evaluates the system " +
      "against those weights. The score is self-certified within Hell-x's own simulation boundary. " +
      "No external benchmark has validated the weighting model. " +
      "Grade is NOW CAPPED AT 'B' until external hell-x-bench validation (Step 15).",
    scopeExclusions: [
      "DOES NOT reflect: externally validated code quality",
      "DOES NOT reflect: comparison against real projects or baseline agents",
      "DOES NOT reflect: DORA Elite performance on real repositories",
      "PREVIOUS '100/100 A+' CLAIM IS RETIRED — replaced by externally-anchored score",
    ],
    measurementScope: "SIMULATION_IN_MEMORY",
    independentlyVerified: false,
    upgradeRequirements: [
      "Step 02: Anchor each dimension to published external standard (DONE)",
      "Step 15: Run hell-x-bench against Claude Code baseline",
      "Step 16: Have external observer validate score calculation",
      "Only then: remove grade cap and publish A/A+ grades",
    ],
    externalBenchmarkReference: "DORA 2023 State of DevOps; OWASP ASVS L2; SLSA v1.0",
  },
  {
    metricId: "BENCH-001",
    displayName: "Comparative Benchmark: Hell-x vs Ordinary Copilot",
    claimedValue: "0 escaped defects vs 4; 88% mutation kill vs 42%; 3.3x cost efficiency",
    exactDefinition:
      "ComparativeBenchmarkArena pits Hell-x against a hardcoded OrdinaryCopilot object with " +
      "fixed values (4 escaped defects, 42% mutation, $0.125 spend). These are illustrative " +
      "estimates, not measurements from running a real copilot on the same task.",
    scopeExclusions: [
      "DOES NOT include: real Claude Code, Copilot, or Codex execution",
      "DOES NOT include: same task, same budget, same environment comparison",
      "DOES NOT include: independent verification of baseline numbers",
      "Ordinary copilot values are illustrative — not measured from any real tool",
    ],
    measurementScope: "SIMULATION_IN_MEMORY",
    independentlyVerified: false,
    upgradeRequirements: [
      "Step 15: Create hell-x-bench repository with real engineering task scenarios",
      "Step 16: Run Claude Code baseline on identical tasks with identical token budget",
      "Step 17: Have independent observer verify both runs",
      "Only then: publish comparison numbers as externally validated",
    ],
    externalBenchmarkReference: "SWE-bench; HumanEval; OpenAI Evals framework",
  },
  {
    metricId: "SLSA-001",
    displayName: "SLSA Level 3 Provenance",
    claimedValue: "SLSA Level 3 Sealed",
    exactDefinition:
      "The SLSAEngine generates a structurally correct in-toto SLSA v1.0 statement " +
      "signed with an RSA-2048 key generated at runtime. The statement is stored in memory. " +
      "No real CI pipeline, no real build environment isolation, no real Sigstore transparency log.",
    scopeExclusions: [
      "DOES NOT include: real hermetic build environment (SLSA L3 requirement)",
      "DOES NOT include: Sigstore Rekor transparency log entry",
      "DOES NOT include: real GitHub Actions or Cloud Build OIDC token",
      "In-memory only — not a real supply chain guarantee",
    ],
    measurementScope: "UNIT_TEST_HARNESS",
    independentlyVerified: false,
    upgradeRequirements: [
      "Integrate with GitHub Actions using OIDC token-based Sigstore signing",
      "Store provenance in Rekor transparency log",
      "Verify with cosign verify-attestation against public key",
      "Then claim SLSA L3 as production-verified",
    ],
    externalBenchmarkReference: "https://slsa.dev/spec/v1.0/levels#build-l3",
  },
  {
    metricId: "TEST-001",
    displayName: "Automated Test Suite",
    claimedValue: "98/98 tests passing",
    exactDefinition:
      "98 vitest unit and integration tests pass on the Hell-x TypeScript codebase. " +
      "These tests verify in-process behavior of the Engineering OS modules. " +
      "All tests run in < 20 seconds on a developer machine.",
    scopeExclusions: [
      "DOES NOT include: real LLM API calls (mocked)",
      "DOES NOT include: real Git operations (mocked)",
      "DOES NOT include: real network requests",
      "DOES NOT include: end-to-end mission on real repositories",
    ],
    measurementScope: "UNIT_TEST_HARNESS",
    independentlyVerified: false,
    upgradeRequirements: [
      "Step 17: Add CI badge with external GitHub Actions runner verification",
      "Step 20: Add long-horizon integration tests on real repositories",
    ],
    externalBenchmarkReference: "Vitest v3.2; Node.js ≥20.0",
  },
]);

/**
 * Returns the benchmark card for a given metric ID.
 */
export function getBenchmarkCard(metricId: string): BenchmarkMetricCard | undefined {
  return HELL_X_BENCHMARK_CARD.find((c) => c.metricId === metricId);
}

/**
 * Returns all metrics that are still at SIMULATION_IN_MEMORY scope.
 * These are the claims that must not be published as production-grade.
 */
export function getSimulationScopeMetrics(): BenchmarkMetricCard[] {
  return [...HELL_X_BENCHMARK_CARD].filter((c) => c.measurementScope === "SIMULATION_IN_MEMORY");
}
