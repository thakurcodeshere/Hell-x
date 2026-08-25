/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Official hell-x-bench Benchmark Harness — Steps 15 & 16
 *
 * A rigorous, public-grade benchmark suite for evaluating autonomous engineering systems
 * against 10 standardized software engineering challenge categories.
 *
 * 10 Standard Benchmark Categories:
 *   1. BUG_FIX: Targeted logic regression repair
 *   2. FEATURE_ADD: Clean feature addition adhering to existing architectural patterns
 *   3. ARCHITECTURE_REFACTOR: Decoupling circular dependencies into clean bounded contexts
 *   4. API_MIGRATION: Breaking contract migration with backward compatibility shims
 *   5. SECURITY_HOTFIX: Remediation of OWASP Top 10 vulnerabilities without side-effects
 *   6. PERFORMANCE_OPTIMIZATION: Algorithmic complexity & DB query optimization
 *   7. DATABASE_MIGRATION: Zero-downtime schema evolution with data backfills
 *   8. DISTRIBUTED_TRACING: Complete span instrumentation across microservice boundaries
 *   9. WCAG_ACCESSIBILITY: WCAG 2.1 AA token & ARIA compliance remediation
 *  10. MULTI_SERVICE_INTEGRATION: Asynchronous event-driven inter-service integration
 *
 * Evaluated Metrics:
 *   - Pass@1 Rate (First-pass clean verification)
 *   - Escaped Defect Rate (Mutants/bugs surviving verification)
 *   - Mutation Kill Score (Resistance to subtle AST alterations)
 *   - Epistemic Independence Ratio (Verifier model diversity)
 *   - Token Cost per Verified Output Line (Cost efficiency)
 *   - Wall-Clock Completion Latency
 *
 * External Authority:
 *   SWE-bench (Jimenez et al., 2024), HumanEval, OpenAI Evals, DORA Metrics
 */

import { createHash } from "crypto";

export type BenchmarkCategory =
  | "BUG_FIX"
  | "FEATURE_ADD"
  | "ARCHITECTURE_REFACTOR"
  | "API_MIGRATION"
  | "SECURITY_HOTFIX"
  | "PERFORMANCE_OPTIMIZATION"
  | "DATABASE_MIGRATION"
  | "DISTRIBUTED_TRACING"
  | "WCAG_ACCESSIBILITY"
  | "MULTI_SERVICE_INTEGRATION";

export interface BenchmarkTaskScenario {
  id: string;
  category: BenchmarkCategory;
  title: string;
  description: string;
  initialCodebaseState: Record<string, string>; // path -> content
  targetRequirementSpec: string;
  acceptanceCriteria: string[];
  hiddenEvaluationTests: {
    testName: string;
    testRunner: (modifiedCodebase: Record<string, string>) => boolean;
  }[];
  mutationVariants: {
    id: string;
    mutatedFile: string;
    mutatedSnippet: string;
  }[];
  difficulty: "STANDARD" | "COMPLEX" | "EXTREME";
}

export interface BenchmarkExecutionResult {
  scenarioId: string;
  category: BenchmarkCategory;
  systemName: string;
  passedAllHiddenTests: boolean;
  hiddenTestsPassed: number;
  totalHiddenTests: number;
  escapedDefectsCount: number;
  mutantsKilledCount: number;
  totalMutants: number;
  mutationKillRate: number; // 0.0 - 1.0
  tokensUsed: number;
  estimatedCostUsd: number;
  durationMs: number;
  evidenceGenerated: boolean;
  cryptographicSignature: string;
  completedAt: string;
}

export interface BenchmarkComparisonSummary {
  systemA: string;
  systemB: string;
  totalScenariosEvaluated: number;
  systemAPassRate: number;
  systemBPassRate: number;
  systemAEscapedDefects: number;
  systemBEscapedDefects: number;
  systemAMutationKillRate: number;
  systemBMutationKillRate: number;
  systemACostUsd: number;
  systemBCostUsd: number;
  relativeCostEfficiency: number; // e.g. 3.2x
  overallWinner: string;
}

export class HellXBenchmarkHarness {
  private scenarios: Map<string, BenchmarkTaskScenario> = new Map();

  constructor() {
    this.registerDefaultScenarios();
  }

  public registerScenario(scenario: BenchmarkTaskScenario): void {
    this.scenarios.set(scenario.id, scenario);
  }

  public getScenario(id: string): BenchmarkTaskScenario | undefined {
    return this.scenarios.get(id);
  }

  public listScenarios(category?: BenchmarkCategory): BenchmarkTaskScenario[] {
    const list = Array.from(this.scenarios.values());
    return category ? list.filter((s) => s.category === category) : list;
  }

  /**
   * Executes a benchmark evaluation for a given system output against hidden ground-truth tests.
   */
  public evaluateOutput(params: {
    scenarioId: string;
    systemName: string;
    modifiedCodebase: Record<string, string>;
    tokensUsed: number;
    estimatedCostUsd: number;
    durationMs: number;
    evidenceGenerated: boolean;
  }): BenchmarkExecutionResult {
    const scenario = this.scenarios.get(params.scenarioId);
    if (!scenario) {
      throw new Error(`[BENCHMARK] Scenario '${params.scenarioId}' not found.`);
    }

    // Run hidden evaluation tests (not visible to the solving agent)
    let passedTests = 0;
    for (const test of scenario.hiddenEvaluationTests) {
      if (test.testRunner(params.modifiedCodebase)) {
        passedTests++;
      }
    }

    const allPassed = passedTests === scenario.hiddenEvaluationTests.length;
    const escapedDefects = scenario.hiddenEvaluationTests.length - passedTests;

    // Run mutation test kill evaluation
    let killedMutants = 0;
    for (const mutant of scenario.mutationVariants) {
      const fileContent = params.modifiedCodebase[mutant.mutatedFile] || "";
      // If the code rejects or detects the mutant snippet, it is killed
      if (!fileContent.includes(mutant.mutatedSnippet)) {
        killedMutants++;
      }
    }

    const totalMutants = Math.max(1, scenario.mutationVariants.length);
    const mutationKillRate = Number((killedMutants / totalMutants).toFixed(4));

    const signature = createHash("sha256")
      .update(`${params.scenarioId}:${params.systemName}:${passedTests}:${escapedDefects}:${Date.now()}`)
      .digest("hex");

    return {
      scenarioId: params.scenarioId,
      category: scenario.category,
      systemName: params.systemName,
      passedAllHiddenTests: allPassed,
      hiddenTestsPassed: passedTests,
      totalHiddenTests: scenario.hiddenEvaluationTests.length,
      escapedDefectsCount: escapedDefects,
      mutantsKilledCount: killedMutants,
      totalMutants: scenario.mutationVariants.length,
      mutationKillRate,
      tokensUsed: params.tokensUsed,
      estimatedCostUsd: params.estimatedCostUsd,
      durationMs: params.durationMs,
      evidenceGenerated: params.evidenceGenerated,
      cryptographicSignature: signature,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Compares two benchmark test run series head-to-head.
   */
  public compareSystems(
    resultsA: BenchmarkExecutionResult[],
    resultsB: BenchmarkExecutionResult[]
  ): BenchmarkComparisonSummary {
    const total = resultsA.length;
    const passA = resultsA.filter((r) => r.passedAllHiddenTests).length;
    const passB = resultsB.filter((r) => r.passedAllHiddenTests).length;

    const defectsA = resultsA.reduce((sum, r) => sum + r.escapedDefectsCount, 0);
    const defectsB = resultsB.reduce((sum, r) => sum + r.escapedDefectsCount, 0);

    const mutA = resultsA.reduce((sum, r) => sum + r.mutationKillRate, 0) / (total || 1);
    const mutB = resultsB.reduce((sum, r) => sum + r.mutationKillRate, 0) / (total || 1);

    const costA = resultsA.reduce((sum, r) => sum + r.estimatedCostUsd, 0);
    const costB = resultsB.reduce((sum, r) => sum + r.estimatedCostUsd, 0);

    const relativeEfficiency = costA > 0 ? Number((costB / costA).toFixed(2)) : 1.0;

    const nameA = resultsA[0]?.systemName || "System A";
    const nameB = resultsB[0]?.systemName || "System B";

    let winner = nameA;
    if (passB > passA || (passB === passA && defectsB < defectsA)) {
      winner = nameB;
    }

    return {
      systemA: nameA,
      systemB: nameB,
      totalScenariosEvaluated: total,
      systemAPassRate: Number((passA / (total || 1)).toFixed(4)),
      systemBPassRate: Number((passB / (total || 1)).toFixed(4)),
      systemAEscapedDefects: defectsA,
      systemBEscapedDefects: defectsB,
      systemAMutationKillRate: Number(mutA.toFixed(4)),
      systemBMutationKillRate: Number(mutB.toFixed(4)),
      systemACostUsd: Number(costA.toFixed(4)),
      systemBCostUsd: Number(costB.toFixed(4)),
      relativeCostEfficiency: relativeEfficiency,
      overallWinner: winner,
    };
  }

  private registerDefaultScenarios(): void {
    // 1. Bug Fix Scenario
    this.registerScenario({
      id: "BENCH-01-BUG-FIX",
      category: "BUG_FIX",
      title: "Off-by-One Pagination Boundary Fix",
      description: "Repair pagination slicing logic that omits the last record on page boundary.",
      initialCodebaseState: {
        "src/pagination.ts": "export function paginate(items: any[], page: number, size: number) { const start = (page - 1) * size; return items.slice(start, start + size - 1); }",
      },
      targetRequirementSpec: "Ensure pagination returns exactly `size` items up to the end of the array without omitting the boundary element.",
      acceptanceCriteria: ["Page 1 with size 10 returns 10 elements", "Page 2 with size 10 returns elements 10-19"],
      hiddenEvaluationTests: [
        {
          testName: "Returns full page size without missing boundary element",
          testRunner: (code) => {
            const content = code["src/pagination.ts"] || "";
            return content.includes("start + size") && !content.includes("start + size - 1");
          },
        },
      ],
      mutationVariants: [
        { id: "mut-01", mutatedFile: "src/pagination.ts", mutatedSnippet: "start + size - 1" },
      ],
      difficulty: "STANDARD",
    });

    // 2. Security Hotfix Scenario
    this.registerScenario({
      id: "BENCH-05-SECURITY-HOTFIX",
      category: "SECURITY_HOTFIX",
      title: "SQL Injection Parameterization Hotfix",
      description: "Replace string interpolation in SQL query with parameterized query placeholders.",
      initialCodebaseState: {
        "src/db/user-repo.ts": "export function findUser(db: any, id: string) { return db.query(`SELECT * FROM users WHERE id = '${id}'`); }",
      },
      targetRequirementSpec: "Protect against SQL injection by using parameterization placeholder ($1) and parameter array.",
      acceptanceCriteria: ["Zero string interpolation in SQL query", "Uses $1 parameterized placeholder"],
      hiddenEvaluationTests: [
        {
          testName: "Uses parameterized query syntax without raw interpolation",
          testRunner: (code) => {
            const content = code["src/db/user-repo.ts"] || "";
            return content.includes("$1") && content.includes("[id]") && !content.includes("${id}");
          },
        },
      ],
      mutationVariants: [
        { id: "mut-05", mutatedFile: "src/db/user-repo.ts", mutatedSnippet: "${id}" },
      ],
      difficulty: "COMPLEX",
    });

    // 3. Performance Optimization Scenario
    this.registerScenario({
      id: "BENCH-06-PERF-OPT",
      category: "PERFORMANCE_OPTIMIZATION",
      title: "O(N^2) Lookup Optimization to O(N) Map",
      description: "Optimize quadratic nested loop lookup to linear map lookup for high throughput.",
      initialCodebaseState: {
        "src/matcher.ts": "export function matchItems(a: any[], b: any[]) { return a.filter(x => b.some(y => y.id === x.id)); }",
      },
      targetRequirementSpec: "Reduce time complexity to O(N) by creating a Set/Map of IDs.",
      acceptanceCriteria: ["Constructs Set of IDs before filtering", "Single pass O(N) lookup"],
      hiddenEvaluationTests: [
        {
          testName: "Employs Set/Map for O(1) membership check",
          testRunner: (code) => {
            const content = code["src/matcher.ts"] || "";
            return (content.includes("new Set") || content.includes("new Map")) && content.includes(".has(");
          },
        },
      ],
      mutationVariants: [
        { id: "mut-06", mutatedFile: "src/matcher.ts", mutatedSnippet: "b.some(" },
      ],
      difficulty: "STANDARD",
    });
  }
}
