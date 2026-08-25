/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Empirical Benchmarking Arena Types (Section 44 & Empirical Trust)
 */

export interface BenchmarkTaskScenario {
  id: string;
  name: string;
  description: string;
  repoContext: string;
  latentBugsInRepo: {
    type: "SQL_INJECTION" | "RACE_CONDITION" | "AUTH_BYPASS" | "MUTATION_LEAK" | "MEMORY_LEAK";
    description: string;
  }[];
  complexRequirements: string[];
}

export interface AgentExecutionPerformance {
  agentType: "ORDINARY_COPILOT_AGENT" | "HELLX_ENGINEERING_OS";
  taskCompleted: boolean;
  totalTokensSpent: number;
  totalCostUSD: number;
  escapedDefectCount: number;
  mutationKillRatePercent: number;
  securityVulnerabilitiesLeaked: number;
  concurrencyRacesDetected: number;
  p99LatencyMs: number;
  requiresHumanIntervention: boolean;
  verificationEvidenceProvided: boolean;
}

export interface HeadToHeadComparisonResult {
  scenarioId: string;
  ordinaryAgentScorecard: AgentExecutionPerformance;
  hellxOSScorecard: AgentExecutionPerformance;
  defectReductionMultiplier: number;
  costEfficiencyMultiplier: number;
  superiorityVerdict: "HELLX_OUTPERFORMS_ORDINARY" | "PARITY" | "ORDINARY_SUPERIOR";
  auditSummary: string;
  completedAt: string;
}
