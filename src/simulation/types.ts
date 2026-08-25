/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Blast Radius & Cascading Simulation Types (Section 28 & 29)
 */

export interface BlastRadiusSimulation {
  id: string;
  sourceTarget: string;
  directImpactNodes: string[];
  transitiveImpactNodes: string[];
  cascadingFailureProbability: number; // 0.0 - 1.0
  riskTier: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  databaseLockContentionRisk: boolean;
  breakingContractCount: number;
  mitigationSteps: string[];
  createdAt: string;
}

export interface CascadingFailureScenario {
  failureNodeId: string;
  triggerEvent: string;
  propagationPath: string[];
  estimatedTTRSeconds: number;
  circuitBreakerTripped: boolean;
}
