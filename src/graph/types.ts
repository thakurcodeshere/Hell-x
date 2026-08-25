/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 2: Engineering Graph & DAG Engine Types
 */

export type GraphNodeType =
  | "REQUIREMENT"
  | "ADR"
  | "DOMAIN_ENTITY"
  | "API_CONTRACT"
  | "DB_SCHEMA"
  | "TASK_NODE"
  | "EVIDENCE";

export type GraphEdgeType =
  | "JUSTIFIES"
  | "IMPLEMENTS"
  | "EVIDENCED_BY"
  | "DEPENDS_ON"
  | "MUTATES"
  | "CALLS";

export interface GraphNode {
  id: string;
  code: string;
  type: GraphNodeType;
  title: string;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: GraphEdgeType;
  description?: string;
}

export interface ExecutionTier {
  tierNumber: number;
  parallelExecutableNodes: GraphNode[];
}

export interface ImpactAnalysisResult {
  targetNodeId: string;
  targetNodeCode: string;
  targetNodeType: GraphNodeType;
  directDownstreamDependents: GraphNode[];
  transitiveBlastRadius: GraphNode[];
  affectedAPIs: string[];
  affectedTables: string[];
  affectedRequirements: string[];
  riskRating: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}
