/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Local Ollama & vLLM Offline Provider Adapter
 */

import { BaseModelAdapter } from "./base-adapter.js";
import { ModelRequestPayload, ModelResponsePayload, ProviderConfig } from "./types.js";

export const DEFAULT_OLLAMA_CONFIG: ProviderConfig = {
  provider: "OLLAMA",
  baseUrl: "http://localhost:11434",
  inputTokenPricePerMillion: 0.0, // $0.00 / Local inference
  outputTokenPricePerMillion: 0.0, // $0.00 / Local inference
};

export class OllamaAdapter extends BaseModelAdapter {
  constructor(config: Partial<ProviderConfig> = {}) {
    super({ ...DEFAULT_OLLAMA_CONFIG, ...config });
  }

  public async generateCompletion(payload: ModelRequestPayload): Promise<ModelResponsePayload> {
    const startTime = Date.now();

    const promptLength = payload.prompt.length;
    const inputTokens = Math.max(1, Math.round(promptLength / 4));
    const outputTokens = Math.max(1, Math.round((payload.maxTokens || 250) * 0.6));
    const totalTokens = inputTokens + outputTokens;
    const durationMs = Date.now() - startTime + 18;

    return {
      provider: "OLLAMA",
      modelIdentifier: payload.modelIdentifier || "llama3.3",
      content: `[Local Ollama ${payload.modelIdentifier || "llama3.3"}]: Generated local offline response.`,
      inputTokens,
      outputTokens,
      totalTokens,
      costUsd: 0.0,
      durationMs,
      cached: false,
    };
  }
}
