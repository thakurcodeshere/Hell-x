/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Cost Intelligence & Token Telemetry Engine
 */

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens?: number;
}

export interface ModelPricing {
  promptPer1kUsd: number;
  completionPer1kUsd: number;
}

export const MODEL_PRICING_TABLE: Record<string, ModelPricing> = {
  "gemini-2.5-flash": { promptPer1kUsd: 0.0001, completionPer1kUsd: 0.0004 },
  "gemini-2.5-pro": { promptPer1kUsd: 0.00125, completionPer1kUsd: 0.005 },
  "claude-3-5-sonnet": { promptPer1kUsd: 0.003, completionPer1kUsd: 0.015 },
  "claude-3-5-haiku": { promptPer1kUsd: 0.0008, completionPer1kUsd: 0.004 },
  "gpt-4o": { promptPer1kUsd: 0.0025, completionPer1kUsd: 0.01 },
  "gpt-4o-mini": { promptPer1kUsd: 0.00015, completionPer1kUsd: 0.0006 },
  "mock-test-model": { promptPer1kUsd: 0.0, completionPer1kUsd: 0.0 },
};

export interface CostRecord {
  id: string;
  timestamp: string;
  taskId: string;
  requirementCode?: string;
  agentRole: string;
  model: string;
  usage: TokenUsage;
  latencyMs: number;
  costUsd: number;
}

export class CostTracker {
  private records: CostRecord[] = [];

  public recordUsage(params: {
    id: string;
    taskId: string;
    requirementCode?: string;
    agentRole: string;
    model: string;
    usage: TokenUsage;
    latencyMs: number;
  }): CostRecord {
    const pricing = MODEL_PRICING_TABLE[params.model] || {
      promptPer1kUsd: 0.001,
      completionPer1kUsd: 0.002,
    };

    const promptCost = (params.usage.promptTokens / 1000) * pricing.promptPer1kUsd;
    const completionCost = (params.usage.completionTokens / 1000) * pricing.completionPer1kUsd;
    const totalCostUsd = promptCost + completionCost;

    const record: CostRecord = {
      id: params.id,
      timestamp: new Date().toISOString(),
      taskId: params.taskId,
      requirementCode: params.requirementCode,
      agentRole: params.agentRole,
      model: params.model,
      usage: params.usage,
      latencyMs: params.latencyMs,
      costUsd: Number(totalCostUsd.toFixed(6)),
    };

    this.records.push(record);
    return record;
  }

  public getTotalCost(): number {
    return Number(this.records.reduce((sum, r) => sum + r.costUsd, 0).toFixed(6));
  }

  public getCostForTask(taskId: string): number {
    return Number(
      this.records
        .filter((r) => r.taskId === taskId)
        .reduce((sum, r) => sum + r.costUsd, 0)
        .toFixed(6)
    );
  }

  public getCostForRequirement(reqCode: string): number {
    return Number(
      this.records
        .filter((r) => r.requirementCode === reqCode)
        .reduce((sum, r) => sum + r.costUsd, 0)
        .toFixed(6)
    );
  }

  public getRecords(): readonly CostRecord[] {
    return this.records;
  }
}
