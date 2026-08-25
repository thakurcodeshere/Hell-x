/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Self-Healing Incident Remediation Types
 */

export interface IncidentReport {
  id: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  source: "PROMETHEUS_SLO" | "SECURITY_SCANNER" | "EXCEPTION_TRACKER";
  description: string;
  errorStack?: string;
  affectedEndpoint?: string;
  metricBreached?: string;
  observedValue?: number;
  thresholdValue?: number;
  detectedAt: string;
}

export interface RootCauseAnalysis {
  incidentId: string;
  rootCauseSummary: string;
  affectedFiles: string[];
  defectCategory: "SQL_INJECTION" | "MEMORY_LEAK" | "UNHANDLED_EXCEPTION" | "LATENCY_SPIKE" | "SECRET_LEAK";
  confidenceScore: number;
  recommendedRemediation: string;
  analyzedAt: string;
}

export interface HotfixPatch {
  id: string;
  incidentId: string;
  targetFile: string;
  gitBranch: string;
  patchDiff: string;
  verificationTestCode: string;
  synthesizedByAgentId: string;
  createdAt: string;
}

export interface RemediationResult {
  incidentId: string;
  hotfixId: string;
  success: boolean;
  canaryPromotionPercentage: number;
  slsaProvenanceHash: string;
  mutationKillScore: number;
  distilledRuleCode: string;
  durationMs: number;
  resolvedAt: string;
}
