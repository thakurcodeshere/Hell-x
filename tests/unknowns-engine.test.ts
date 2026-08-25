import { describe, it, expect } from "vitest";
import { UnknownsEngine } from "../src/requirements/unknowns-engine.js";

describe("UnknownsEngine (Layer 02 - No Silent Hallucinations)", () => {
  it("registers explicit unknowns and resolves them with actor attribution", () => {
    const engine = new UnknownsEngine();

    const unknown = engine.registerUnknown({
      category: "SECURITY_POLICY",
      question: "Is multi-factor authentication mandatory for single-tenant enterprise accounts?",
      impactOnRequirements: ["REQ-AUTH-001"],
      proposedDefaultAssumption: "Assume MFA is mandatory for enterprise tier.",
    });

    expect(unknown.code).toBe("UNKNOWN-001");
    expect(engine.getOpenUnknowns().length).toBe(1);

    const resolved = engine.resolveUnknown(
      unknown.id,
      "Confirmed mandatory for enterprise tier.",
      "security-officer-01"
    );

    expect(resolved.status).toBe("RESOLVED");
    expect(resolved.resolvedByActorId).toBe("security-officer-01");
    expect(engine.getOpenUnknowns().length).toBe(0);
  });
});
