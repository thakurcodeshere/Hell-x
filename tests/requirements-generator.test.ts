import { describe, it, expect } from "vitest";
import { RequirementGenerator } from "../src/requirements/generator.js";
import { IntentParser } from "../src/intent/parser.js";

describe("RequirementGenerator (Layer 02)", () => {
  const parser = new IntentParser();
  const generator = new RequirementGenerator();

  it("decomposes intent into atomic, validated RequirementArtifacts", async () => {
    const intent = await parser.parseIntent(
      "Build a payment checkout flow that accepts credit cards, charges customers, and logs invoices."
    );

    const reqs = generator.generateRequirements(intent);
    expect(reqs.length).toBeGreaterThanOrEqual(1);

    const primaryReq = reqs[0];
    expect(primaryReq.type).toBe("REQUIREMENT");
    expect(primaryReq.code).toMatch(/^REQ-[A-Z0-9]+-\d+$/);
    expect(primaryReq.acceptanceCriteria.length).toBeGreaterThan(0);
    expect(primaryReq.completenessRadar.functional).toBeGreaterThan(0.7);
  });
});
