/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Precision Context Pack Generator (Section 14)
 */

import { RequirementArtifact, ADRArtifact } from "../core/artifacts.js";
import { APIEndpointContract, DatabaseTableSchema } from "../blueprint/types.js";
import { Role } from "../core/types.js";

export interface ContextPack {
  taskId: string;
  taskTitle: string;
  assignedRole: Role;
  maxTokenBudget: number;
  objective: string;
  constraints: string[];
  boundRequirements: {
    code: string;
    title: string;
    acceptanceCriteria: string[];
  }[];
  relevantADRs: {
    code: string;
    decision: string;
  }[];
  apiContracts?: APIEndpointContract[];
  databaseSchemas?: DatabaseTableSchema[];
  targetFilePaths: string[];
  systemInstructions: string;
  estimatedTokens: number;
}

export class ContextPackEngine {
  /**
   * Builds a tailored, minimal context pack for an assigned worker agent
   */
  public generateContextPack(params: {
    taskId: string;
    taskTitle: string;
    assignedRole: Role;
    objective: string;
    constraints: string[];
    requirements: RequirementArtifact[];
    adrs?: ADRArtifact[];
    apiContracts?: APIEndpointContract[];
    databaseSchemas?: DatabaseTableSchema[];
    targetFilePaths: string[];
    maxTokenBudget?: number;
  }): ContextPack {
    const boundReqs = params.requirements.map((r) => ({
      code: r.code,
      title: r.title,
      acceptanceCriteria: r.acceptanceCriteria,
    }));

    const relevantADRs = (params.adrs || []).map((a) => ({
      code: a.code,
      decision: a.decision,
    }));

    const systemInstructions = [
      `You are operating strictly under the role: ${params.assignedRole}.`,
      `Your task is: ${params.taskTitle}.`,
      `Objective: ${params.objective}`,
      `Strictly adhere to the acceptance criteria and constraints in this pack.`,
      `Do NOT attempt self-approval. Submit code changes with verifiable tests.`,
    ].join("\n");

    const rawPackText = JSON.stringify({
      ...params,
      boundReqs,
      relevantADRs,
      systemInstructions,
    });

    // Approximation: 1 token ~ 4 characters
    const estimatedTokens = Math.ceil(rawPackText.length / 4);

    return {
      taskId: params.taskId,
      taskTitle: params.taskTitle,
      assignedRole: params.assignedRole,
      maxTokenBudget: params.maxTokenBudget || 8000,
      objective: params.objective,
      constraints: params.constraints,
      boundRequirements: boundReqs,
      relevantADRs,
      apiContracts: params.apiContracts,
      databaseSchemas: params.databaseSchemas,
      targetFilePaths: params.targetFilePaths,
      systemInstructions,
      estimatedTokens,
    };
  }
}
