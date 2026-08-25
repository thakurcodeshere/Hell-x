/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Live Model Provider Adapters Types
 */

export type ModelProviderType = "OPENAI" | "ANTHROPIC" | "GEMINI" | "OLLAMA" | "OPENROUTER";

export interface ModelRequestPayload {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  modelIdentifier: string;
  stream?: boolean;
}

export interface ModelResponsePayload {
  provider: ModelProviderType;
  modelIdentifier: string;
  content: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  durationMs: number;
  cached: boolean;
}

export interface ProviderConfig {
  provider: ModelProviderType;
  apiKey?: string;
  baseUrl?: string;
  organizationId?: string;
  timeoutMs?: number;
  maxRetries?: number;
  inputTokenPricePerMillion: number;
  outputTokenPricePerMillion: number;
}
