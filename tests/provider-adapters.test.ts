import { describe, it, expect } from "vitest";
import { OpenAIAdapter } from "../src/gateway/adapters/openai-adapter.js";
import { AnthropicAdapter } from "../src/gateway/adapters/anthropic-adapter.js";
import { GeminiAdapter } from "../src/gateway/adapters/gemini-adapter.js";
import { OllamaAdapter } from "../src/gateway/adapters/ollama-adapter.js";

describe("Live Model Provider Adapters (Milestone 9)", () => {
  it("calculates tokens and costs for OpenAI GPT-4o accurately", async () => {
    const adapter = new OpenAIAdapter();
    const res = await adapter.generateCompletion({
      prompt: "Decompose this domain requirement into microservice endpoints",
      modelIdentifier: "gpt-4o",
      maxTokens: 500,
    });

    expect(res.provider).toBe("OPENAI");
    expect(res.modelIdentifier).toBe("gpt-4o");
    expect(res.inputTokens).toBeGreaterThan(0);
    expect(res.outputTokens).toBeGreaterThan(0);
    expect(res.costUsd).toBeGreaterThan(0);
  });

  it("calculates tokens and costs for Anthropic Claude accurately", async () => {
    const adapter = new AnthropicAdapter();
    const res = await adapter.generateCompletion({
      prompt: "Review this Architecture Decision Record for security flaws",
      modelIdentifier: "claude-3-5-sonnet",
    });

    expect(res.provider).toBe("ANTHROPIC");
    expect(res.modelIdentifier).toBe("claude-3-5-sonnet");
    expect(res.costUsd).toBeGreaterThan(0);
  });

  it("calculates tokens and costs for Google Gemini accurately", async () => {
    const adapter = new GeminiAdapter();
    const res = await adapter.generateCompletion({
      prompt: "Audit accessibility contrast on this design token system",
      modelIdentifier: "gemini-1.5-pro",
    });

    expect(res.provider).toBe("GEMINI");
    expect(res.costUsd).toBeGreaterThan(0);
  });

  it("calculates local offline inference for Ollama with $0.00 cost", async () => {
    const adapter = new OllamaAdapter();
    const res = await adapter.generateCompletion({
      prompt: "Synthesize unit test cases for checkout logic",
      modelIdentifier: "llama3.3",
    });

    expect(res.provider).toBe("OLLAMA");
    expect(res.costUsd).toBe(0.0);
  });
});
