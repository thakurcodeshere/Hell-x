/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 1: Requirement Intelligence Types
 */

import { RequirementArtifact } from "../core/artifacts.js";

export type ConflictType =
  | "DIRECT_CONTRADICTION"
  | "DATA_RETENTION_VS_DELETION"
  | "SECURITY_VS_USABILITY"
  | "PERFORMANCE_VS_CONSISTENCY"
  | "TEMPORAL_ORDER_MISMATCH";

export interface RequirementConflict {
  id: string;
  type: ConflictType;
  severity: "HIGH" | "CRITICAL" | "MEDIUM";
  requirementACode: string;
  requirementBCode: string;
  statementA: string;
  statementB: string;
  explanation: string;
  suggestedResolution: string;
  resolved: boolean;
  resolutionNotes?: string;
}

export interface CompletenessRadar10D {
  functional: number; // 0.0 - 1.0
  ux: number;
  data: number;
  security: number;
  operational: number;
  integration: number;
  errorHandling: number;
  scalability: number;
  compliance: number;
  observability: number;
}

export interface CompletenessReport {
  requirementCode: string;
  overallScore: number; // 0.0 - 1.0
  radar: CompletenessRadar10D;
  isReadyForArchitecture: boolean;
  missingDimensions: string[];
  recommendations: string[];
}

export interface ExplicitUnknown {
  id: string;
  code: string; // UNKNOWN-001
  category: "BUSINESS_RULE" | "DATA_CONTRACT" | "SECURITY_POLICY" | "THIRD_PARTY_API" | "UX_FLOW" | "COMPLIANCE_POLICY";
  question: string;
  impactOnRequirements: string[];
  proposedDefaultAssumption: string;
  status: "OPEN" | "RESOLVED" | "DEFERRED";
  resolution?: string;
  resolvedByActorId?: string;
}
