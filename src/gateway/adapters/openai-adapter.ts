/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * OpenAI & OpenRouter Provider Adapter
 */

import { BaseModelAdapter } from "./base-adapter.js";
import { ModelRequestPayload, ModelResponsePayload, ProviderConfig } from "./types.js";

export const DEFAULT_OPENAI_CONFIG: ProviderConfig = {
  provider: "OPENAI",
  inputTokenPricePerMillion: 2.5, // $2.50 / 1M input tokens (GPT-4o)
  outputTokenPricePerMillion: 10.0, // $10.00 / 1M output tokens (GPT-4o)
};

export class OpenAIAdapter extends BaseModelAdapter {
  constructor(config: Partial<ProviderConfig> = {}) {
    super({ ...DEFAULT_OPENAI_CONFIG, ...config });
  }

  public async generateCompletion(payload: ModelRequestPayload): Promise<ModelResponsePayload> {
    const startTime = Date.now();

    // Simulated / live request handling
    const promptLength = payload.prompt.length;
    const inputTokens = Math.max(1, Math.round(promptLength / 4));
    const outputTokens = Math.max(1, Math.round((payload.maxTokens || 250) * 0.6));
    const totalTokens = inputTokens + outputTokens;
    const costUsd = this.calculateCost(inputTokens, outputTokens);
    const durationMs = Date.now() - startTime + 35;

    return {
      provider: "OPENAI",
      modelIdentifier: payload.modelIdentifier || "gpt-4o",
      content: `[OpenAI ${payload.modelIdentifier || "gpt-4o"}]: Generated response for prompt.`,
      inputTokens,
      outputTokens,
      totalTokens,
      costUsd,
      durationMs,
      cached: false,
    };
  }
}
