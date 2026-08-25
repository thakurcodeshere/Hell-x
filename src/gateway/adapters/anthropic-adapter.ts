/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Anthropic Claude Provider Adapter
 */

import { BaseModelAdapter } from "./base-adapter.js";
import { ModelRequestPayload, ModelResponsePayload, ProviderConfig } from "./types.js";

export const DEFAULT_ANTHROPIC_CONFIG: ProviderConfig = {
  provider: "ANTHROPIC",
  inputTokenPricePerMillion: 3.0, // $3.00 / 1M input tokens (Claude 3.5 Sonnet)
  outputTokenPricePerMillion: 15.0, // $15.00 / 1M output tokens (Claude 3.5 Sonnet)
};

export class AnthropicAdapter extends BaseModelAdapter {
  constructor(config: Partial<ProviderConfig> = {}) {
    super({ ...DEFAULT_ANTHROPIC_CONFIG, ...config });
  }

  public async generateCompletion(payload: ModelRequestPayload): Promise<ModelResponsePayload> {
    const startTime = Date.now();

    const promptLength = payload.prompt.length;
    const inputTokens = Math.max(1, Math.round(promptLength / 4));
    const outputTokens = Math.max(1, Math.round((payload.maxTokens || 250) * 0.6));
    const totalTokens = inputTokens + outputTokens;
    const costUsd = this.calculateCost(inputTokens, outputTokens);
    const durationMs = Date.now() - startTime + 42;

    return {
      provider: "ANTHROPIC",
      modelIdentifier: payload.modelIdentifier || "claude-3-5-sonnet",
      content: `[Anthropic ${payload.modelIdentifier || "claude-3-5-sonnet"}]: Generated response for prompt.`,
      inputTokens,
      outputTokens,
      totalTokens,
      costUsd,
      durationMs,
      cached: false,
    };
  }
}
