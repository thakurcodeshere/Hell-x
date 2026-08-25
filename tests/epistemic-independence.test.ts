/**
 * Hell-x Tests: Epistemic Independence & Multi-Model Heterogeneity (Step 20)
 */
import { describe, it, expect } from "vitest";
import {
  EpistemicIndependenceEngine,
  AgentEpistemicProfile,
} from "../src/verification/epistemic-independence.js";

describe("EpistemicIndependenceEngine — Multi-Model Heterogeneity (Step 20)", () => {
  const engine = new EpistemicIndependenceEngine();

  const openAiBuilder: AgentEpistemicProfile = {
    agentId: "agent-builder-openai",
    modelIdentifier: "gpt-4o",
    providerFamily: "OPENAI",
    temperature: 0.2,
    systemPromptHash: "hash-prompt-builder-01",
  };

  const openAiVerifier: AgentEpistemicProfile = {
    agentId: "agent-verifier-openai",
    modelIdentifier: "gpt-4o",
    providerFamily: "OPENAI",
    temperature: 0.2,
    systemPromptHash: "hash-prompt-verifier-01",
  };

  const anthropicVerifier: AgentEpistemicProfile = {
    agentId: "agent-verifier-claude",
    modelIdentifier: "claude-3-5-sonnet",
    providerFamily: "ANTHROPIC",
    temperature: 0.0,
    systemPromptHash: "hash-prompt-verifier-02",
  };

  it("resolves model provider families correctly", () => {
    expect(engine.resolveProviderFamily("gpt-4o")).toBe("OPENAI");
    expect(engine.resolveProviderFamily("claude-3-5-sonnet")).toBe("ANTHROPIC");
    expect(engine.resolveProviderFamily("gemini-1.5-pro")).toBe("GOOGLE_GEMINI");
    expect(engine.resolveProviderFamily("deepseek-coder-v2")).toBe("DEEPSEEK");
    expect(engine.resolveProviderFamily("llama-3-70b")).toBe("OLLAMA_LOCAL");
  });

  it("rejects same-provider verification on high-risk R3/R4/R5 tasks", () => {
    const result = engine.evaluateIndependence(openAiBuilder, openAiVerifier, "R4");
    expect(result.isCompliantForRiskClass).toBe(false);
    expect(result.isProviderDisjoint).toBe(false);
    expect(result.violations.some((v) => v.includes("Epistemic monoculture risk"))).toBe(true);
  });

  it("approves cross-provider verification on high-risk R4 tasks", () => {
    const result = engine.evaluateIndependence(openAiBuilder, anthropicVerifier, "R4");
    expect(result.isCompliantForRiskClass).toBe(true);
    expect(result.isProviderDisjoint).toBe(true);
    expect(result.isModelFamilyDisjoint).toBe(true);
    expect(result.epistemicDiversityScore).toBeGreaterThanOrEqual(0.8);
    expect(result.violations.length).toBe(0);
  });

  it("permits same-provider different-agent on low-risk R1 tasks", () => {
    const result = engine.evaluateIndependence(openAiBuilder, openAiVerifier, "R1");
    expect(result.isCompliantForRiskClass).toBe(true);
  });

  it("catches self-review regardless of risk class", () => {
    const result = engine.evaluateIndependence(openAiBuilder, openAiBuilder, "R0");
    expect(result.isCompliantForRiskClass).toBe(false);
    expect(result.violations.some((v) => v.includes("cannot verify itself"))).toBe(true);
  });
});
