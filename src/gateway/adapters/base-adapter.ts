/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Base Model Provider Adapter with Cost & Timeout Governance
 */

import { ModelRequestPayload, ModelResponsePayload, ProviderConfig, ModelProviderType } from "./types.js";

export abstract class BaseModelAdapter {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = {
      timeoutMs: 15000,
      maxRetries: 3,
      ...config,
    };
  }

  public get providerType(): ModelProviderType {
    return this.config.provider;
  }

  public calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1_000_000) * this.config.inputTokenPricePerMillion;
    const outputCost = (outputTokens / 1_000_000) * this.config.outputTokenPricePerMillion;
    return Number((inputCost + outputCost).toFixed(6));
  }

  public abstract generateCompletion(payload: ModelRequestPayload): Promise<ModelResponsePayload>;
}
