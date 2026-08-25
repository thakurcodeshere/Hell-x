/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 1: Intent Engine Types & Vectors
 */

export interface IntentActor {
  name: string;
  description: string;
  isPrimary: boolean;
  permissionsNeeded: string[];
}

export interface IntentConstraint {
  id: string;
  category: "SECURITY" | "PERFORMANCE" | "COMPLIANCE" | "UX" | "ARCHITECTURAL" | "BUSINESS";
  statement: string;
  isHardConstraint: boolean;
}

export interface IntentOutcome {
  id: string;
  description: string;
  metric: string;
  targetValue?: string;
}

export interface IntentRisk {
  id: string;
  hazard: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  mitigationStrategy?: string;
}

export interface ExtractedIntentVector {
  id: string;
  rawInput: string;
  summary: string;
  problemStatement: string;
  targetDomain: string;
  actors: IntentActor[];
  outcomes: IntentOutcome[];
  constraints: IntentConstraint[];
  assumptions: string[];
  externalDependencies: string[];
  risks: IntentRisk[];
  successCriteria: string[];
  extractedAt: string;
  ambiguityScore: number; // 0.0 (crystal clear) to 1.0 (completely ambiguous)
}
