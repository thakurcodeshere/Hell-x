/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Artifact Schemas & Provenance Models
 */

import { z } from "zod";
import { RiskLevel } from "./types.js";

export const ArtifactTypeSchema = z.enum([
  "REQUIREMENT",
  "ADR",
  "TASK_NODE",
  "EVIDENCE",
  "GATE_DECISION",
  "MEMORY",
]);

export type ArtifactType = z.infer<typeof ArtifactTypeSchema>;

export const BaseArtifactSchema = z.object({
  id: z.string(),
  type: ArtifactTypeSchema,
  version: z.number().int().positive().default(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  authorId: z.string(),
  authorRole: z.string(),
  parentId: z.string().optional(),
  dependencies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  sha256Hash: z.string().optional(),
  immutable: z.boolean().default(true),
});

export type BaseArtifact = z.infer<typeof BaseArtifactSchema>;

// 1. Requirement Artifact (REQ-*)
export const RequirementArtifactSchema = BaseArtifactSchema.extend({
  type: z.literal("REQUIREMENT"),
  code: z.string().regex(/^REQ-[A-Z0-9]+-\d+$/), // e.g. REQ-AUTH-001
  title: z.string().min(3),
  objective: z.string(),
  actor: z.string(),
  trigger: z.string(),
  preconditions: z.array(z.string()),
  workflow: z.array(z.string()),
  expectedResult: z.string(),
  edgeCases: z.array(z.string()),
  constraints: z.array(z.string()),
  acceptanceCriteria: z.array(z.string()),
  verificationMethod: z.string(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  completenessRadar: z.object({
    functional: z.number().min(0).max(1),
    ux: z.number().min(0).max(1),
    data: z.number().min(0).max(1),
    security: z.number().min(0).max(1),
    operational: z.number().min(0).max(1),
    errorHandling: z.number().min(0).max(1),
    compliance: z.number().min(0).max(1),
    observability: z.number().min(0).max(1),
  }),
  explicitUnknowns: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PROPOSED", "VALIDATED", "IN_PROGRESS", "VERIFIED", "REJECTED"]),
});

export type RequirementArtifact = z.infer<typeof RequirementArtifactSchema>;

// 2. Architecture Decision Record (ADR-*)
export const ADRArtifactSchema = BaseArtifactSchema.extend({
  type: z.literal("ADR"),
  code: z.string().regex(/^ADR-\d+$/), // e.g. ADR-001
  title: z.string(),
  status: z.enum(["PROPOSED", "ACCEPTED", "SUPERSEDED", "REJECTED"]),
  contextAndProblem: z.string(),
  decision: z.string(),
  alternativesConsidered: z.array(
    z.object({
      name: z.string(),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
    })
  ),
  consequencesPositive: z.array(z.string()),
  consequencesNegative: z.array(z.string()),
  assumptions: z.array(z.string()),
  affectedRequirements: z.array(z.string()), // List of REQ codes
  securityConsiderations: z.string(),
});

export type ADRArtifact = z.infer<typeof ADRArtifactSchema>;

// 3. Task Node (TASK-*)
export const TaskNodeArtifactSchema = BaseArtifactSchema.extend({
  type: z.literal("TASK_NODE"),
  code: z.string().regex(/^TASK-[A-Z0-9]+-\d+$/),
  title: z.string(),
  description: z.string(),
  assignedRole: z.string(),
  assignedModelTier: z.enum(["TIER_FAST_LOW_COST", "TIER_HIGH_REASONING", "TIER_ADVERSARIAL_VERIFIER"]),
  targetRequirementCode: z.string(),
  isolationBranch: z.string(),
  worktreePath: z.string().optional(),
  status: z.enum(["QUEUED", "RUNNING", "COMPLETED", "VERIFYING", "PASSED", "FAILED", "BLOCKED"]),
  executionProofRequired: z.array(z.string()), // e.g. ["UNIT_TEST", "BROWSER_TRACE", "SECURITY_SCAN"]
  retryCount: z.number().int().nonnegative().default(0),
  costUsd: z.number().default(0.0),
});

export type TaskNodeArtifact = z.infer<typeof TaskNodeArtifactSchema>;

// 4. Evidence Artifact (EVID-*)
export const EvidenceTypeSchema = z.enum([
  "UNIT_TEST_OUTPUT",
  "INTEGRATION_TEST_OUTPUT",
  "BROWSER_SCREENSHOT",
  "BROWSER_TRACE",
  "API_RESPONSE_PAYLOAD",
  "SECURITY_SCAN_REPORT",
  "STATIC_ANALYSIS_REPORT",
  "PERFORMANCE_BENCHMARK",
  "BUILD_LOG",
  "TELEMETRY_SNAPSHOT",
]);

export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

export const EvidenceArtifactSchema = BaseArtifactSchema.extend({
  type: z.literal("EVIDENCE"),
  code: z.string().regex(/^EVID-[A-Z0-9]+-\d+$/),
  evidenceType: EvidenceTypeSchema,
  targetRequirementCode: z.string(),
  targetTaskId: z.string(),
  rawPayload: z.record(z.any()),
  reproducibleCommand: z.string(),
  verifiedPassed: z.boolean(),
  verifierAgentId: z.string(),
  verifierModelIdentifier: z.string(),
  verifierSignature: z.string(),
  claimVsProofDiff: z.string().optional(),
});

export type EvidenceArtifact = z.infer<typeof EvidenceArtifactSchema>;

// 5. Gate Decision Artifact (GATE-*)
export const GateDecisionArtifactSchema = BaseArtifactSchema.extend({
  type: z.literal("GATE_DECISION"),
  code: z.string().regex(/^GATE-[A-Z0-9]+-\d+$/),
  gateType: z.enum(["SPECIFICATION_GATE", "ARCHITECTURE_GATE", "EXECUTION_GATE", "RELEASE_GATE"]),
  status: z.enum(["OPEN", "PASSED", "REJECTED", "BLOCKED"]),
  evaluatedRequirements: z.array(z.string()),
  attachedEvidenceIds: z.array(z.string()),
  violations: z.array(z.string()).default([]),
  approvedByActorId: z.string(),
  approvedByActorType: z.enum(["HUMAN", "SYSTEM_EVALUATOR"]),
  justification: z.string(),
});

export type GateDecisionArtifact = z.infer<typeof GateDecisionArtifactSchema>;

// 6. Memory Artifact (MEM-*)
export const MemoryArtifactSchema = BaseArtifactSchema.extend({
  type: z.literal("MEMORY"),
  code: z.string().regex(/^MEM-[A-Z0-9]+-\d+$/),
  category: z.enum([
    "PRODUCT_MEMORY",
    "ARCHITECTURAL_MEMORY",
    "DESIGN_MEMORY",
    "FAILURE_MEMORY",
    "AGENT_REPUTATION_MEMORY",
    "OPERATIONAL_MEMORY",
    "SECURITY_MEMORY",
    "PROCESS_MEMORY",
  ]),
  summary: z.string(),
  lessonLearned: z.string(),
  preventativeRule: z.string().optional(),
  applicableContext: z.array(z.string()),
  reinforcementScore: z.number().default(1.0),
});

export type MemoryArtifact = z.infer<typeof MemoryArtifactSchema>;

export type AnyArtifact =
  | RequirementArtifact
  | ADRArtifact
  | TaskNodeArtifact
  | EvidenceArtifact
  | GateDecisionArtifact
  | MemoryArtifact;
