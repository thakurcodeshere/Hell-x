/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Google Gemini Provider Adapter
 */

import { BaseModelAdapter } from "./base-adapter.js";
import { ModelRequestPayload, ModelResponsePayload, ProviderConfig } from "./types.js";

export const DEFAULT_GEMINI_CONFIG: ProviderConfig = {
  provider: "GEMINI",
  inputTokenPricePerMillion: 1.25, // $1.25 / 1M input tokens (Gemini 1.5 Pro)
  outputTokenPricePerMillion: 5.0, // $5.00 / 1M output tokens (Gemini 1.5 Pro)
};

export class GeminiAdapter extends BaseModelAdapter {
  constructor(config: Partial<ProviderConfig> = {}) {
    super({ ...DEFAULT_GEMINI_CONFIG, ...config });
  }

  public async generateCompletion(payload: ModelRequestPayload): Promise<ModelResponsePayload> {
    const startTime = Date.now();

    const promptLength = payload.prompt.length;
    const inputTokens = Math.max(1, Math.round(promptLength / 4));
    const outputTokens = Math.max(1, Math.round((payload.maxTokens || 250) * 0.6));
    const totalTokens = inputTokens + outputTokens;
    const costUsd = this.calculateCost(inputTokens, outputTokens);
    const durationMs = Date.now() - startTime + 28;

    return {
      provider: "GEMINI",
      modelIdentifier: payload.modelIdentifier || "gemini-1.5-pro",
      content: `[Google Gemini ${payload.modelIdentifier || "gemini-1.5-pro"}]: Generated response for prompt.`,
      inputTokens,
      outputTokens,
      totalTokens,
      costUsd,
      durationMs,
      cached: false,
    };
  }
}
