/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Pre-Execution Impact & Blast Radius Engine
 */

import { DAGEngine } from "./dag-engine.js";
import { ImpactAnalysisResult } from "./types.js";
import { HellxError } from "../core/errors.js";

export class ImpactEngine {
  constructor(private dagEngine: DAGEngine) {}

  /**
   * Calculates the full blast radius of modifying a target node
   */
  public analyzeImpact(targetIdOrCode: string): ImpactAnalysisResult {
    const node = this.dagEngine.getNode(targetIdOrCode);
    if (!node) {
      throw new HellxError(`Node '${targetIdOrCode}' not found in Engineering DAG.`, "NODE_NOT_FOUND");
    }

    const directDownstream = this.dagEngine.getDirectDownstream(node.id);
    const transitiveDownstream = this.dagEngine.getTransitiveDownstream(node.id);

    const affectedAPIs: string[] = [];
    const affectedTables: string[] = [];
    const affectedRequirements: string[] = [];

    for (const downstream of [node, ...transitiveDownstream]) {
      if (downstream.type === "API_CONTRACT") affectedAPIs.push(downstream.code);
      if (downstream.type === "DB_SCHEMA") affectedTables.push(downstream.code);
      if (downstream.type === "REQUIREMENT") affectedRequirements.push(downstream.code);
    }

    // Risk rating based on blast radius scope
    let riskRating: ImpactAnalysisResult["riskRating"] = "LOW";
    const totalAffected = transitiveDownstream.length;

    if (affectedTables.length > 2 || totalAffected > 8 || node.type === "REQUIREMENT") {
      riskRating = "CRITICAL";
    } else if (affectedTables.length > 0 || affectedAPIs.length > 2 || totalAffected > 4) {
      riskRating = "HIGH";
    } else if (totalAffected > 1) {
      riskRating = "MEDIUM";
    } else {
      riskRating = "LOW";
    }

    return {
      targetNodeId: node.id,
      targetNodeCode: node.code,
      targetNodeType: node.type,
      directDownstreamDependents: directDownstream,
      transitiveBlastRadius: transitiveDownstream,
      affectedAPIs: Array.from(new Set(affectedAPIs)),
      affectedTables: Array.from(new Set(affectedTables)),
      affectedRequirements: Array.from(new Set(affectedRequirements)),
      riskRating,
    };
  }
}
