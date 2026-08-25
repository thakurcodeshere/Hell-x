/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Intelligent Multi-Model Router & Cognitive Gateway
 */

import { AgentRole } from "../core/types.js";
import { CostTracker, TokenUsage } from "./cost-tracker.js";

export type ModelTier = "TIER_FAST_LOW_COST" | "TIER_HIGH_REASONING" | "TIER_ADVERSARIAL_VERIFIER";

export interface ModelSelectionCriteria {
  taskType: string;
  role: AgentRole;
  complexityScore: number; // 0.0 - 1.0
  riskScore: number; // 0.0 - 1.0
  requiresAdversarialVerifier?: boolean;
}

export interface ModelInvocationRequest {
  taskId: string;
  requirementCode?: string;
  role: AgentRole;
  systemPrompt: string;
  userPrompt: string;
  tierOverride?: ModelTier;
  temperature?: number;
}

export interface ModelInvocationResponse {
  content: string;
  modelUsed: string;
  tierUsed: ModelTier;
  usage: TokenUsage;
  latencyMs: number;
  costUsd: number;
}

export interface ModelProvider {
  name: string;
  invoke(params: {
    model: string;
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
  }): Promise<{ content: string; usage: TokenUsage }>;
}

export class MockModelProvider implements ModelProvider {
  public name = "MockProvider";
  public customResponses: Map<string, string> = new Map();

  public async invoke(params: {
    model: string;
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
  }): Promise<{ content: string; usage: TokenUsage }> {
    let content = "MOCK_RESPONSE_OK";

    for (const [key, value] of this.customResponses.entries()) {
      if (params.userPrompt.includes(key) || params.systemPrompt.includes(key)) {
        content = value;
        break;
      }
    }

    return {
      content,
      usage: {
        promptTokens: Math.ceil((params.systemPrompt.length + params.userPrompt.length) / 4),
        completionTokens: Math.ceil(content.length / 4),
        totalTokens:
          Math.ceil((params.systemPrompt.length + params.userPrompt.length) / 4) +
          Math.ceil(content.length / 4),
      },
    };
  }
}

export class ModelRouter {
  private costTracker: CostTracker;
  private primaryProvider: ModelProvider;
  private tierModelMap: Record<ModelTier, string> = {
    TIER_FAST_LOW_COST: "gemini-2.5-flash",
    TIER_HIGH_REASONING: "gemini-2.5-pro",
    TIER_ADVERSARIAL_VERIFIER: "claude-3-5-sonnet",
  };

  constructor(options?: { costTracker?: CostTracker; provider?: ModelProvider }) {
    this.costTracker = options?.costTracker || new CostTracker();
    this.primaryProvider = options?.provider || new MockModelProvider();
  }

  public selectTier(criteria: ModelSelectionCriteria): ModelTier {
    if (criteria.requiresAdversarialVerifier || criteria.role === "SECURITY_TESTER" || criteria.role === "QA_ENGINEER") {
      return "TIER_ADVERSARIAL_VERIFIER";
    }

    if (criteria.riskScore > 0.6 || criteria.complexityScore > 0.6 || criteria.role === "SYSTEM_ARCHITECT" || criteria.role === "SECURITY_ARCHITECT") {
      return "TIER_HIGH_REASONING";
    }

    return "TIER_FAST_LOW_COST";
  }

  public async execute(request: ModelInvocationRequest): Promise<ModelInvocationResponse> {
    const startTime = Date.now();
    const tier =
      request.tierOverride ||
      this.selectTier({
        taskType: "GENERAL",
        role: request.role,
        complexityScore: 0.5,
        riskScore: 0.5,
      });

    const modelName = this.tierModelMap[tier] || "mock-test-model";

    const response = await this.primaryProvider.invoke({
      model: modelName,
      systemPrompt: request.systemPrompt,
      userPrompt: request.userPrompt,
      temperature: request.temperature || 0.2,
    });

    const latencyMs = Date.now() - startTime;

    const record = this.costTracker.recordUsage({
      id: `usage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      taskId: request.taskId,
      requirementCode: request.requirementCode,
      agentRole: request.role,
      model: modelName,
      usage: response.usage,
      latencyMs,
    });

    return {
      content: response.content,
      modelUsed: modelName,
      tierUsed: tier,
      usage: response.usage,
      latencyMs,
      costUsd: record.costUsd,
    };
  }

  public getCostTracker(): CostTracker {
    return this.costTracker;
  }
}
