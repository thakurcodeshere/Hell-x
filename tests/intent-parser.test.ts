import { describe, it, expect } from "vitest";
import { IntentParser } from "../src/intent/parser.js";

describe("IntentParser (Layer 01)", () => {
  const parser = new IntentParser();

  it("extracts structured intent vector from natural language", async () => {
    const raw = "We need an OAuth2 and JWT authentication server with rate limiting for API keys.";
    const intent = await parser.parseIntent(raw);

    expect(intent.targetDomain).toBe("AUTH");
    expect(intent.actors.length).toBeGreaterThan(0);
    expect(intent.ambiguityScore).toBeLessThanOrEqual(0.6);
    expect(intent.successCriteria.length).toBeGreaterThan(0);
  });

  it("identifies critical risks for data deletion requests", async () => {
    const raw = "Build a user management system with hard purge account deletion and database drop capabilities.";
    const intent = await parser.parseIntent(raw);

    expect(intent.risks.some((r) => r.severity === "CRITICAL")).toBe(true);
  });
});
