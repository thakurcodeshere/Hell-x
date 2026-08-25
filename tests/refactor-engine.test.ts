import { describe, it, expect } from "vitest";
import { RefactorEngine } from "../src/mission/refactor-engine.js";

describe("RefactorEngine (Phase 8 / Section 37)", () => {
  const engine = new RefactorEngine();

  it("detects dead code and generates refactoring proposals", () => {
    const files = [
      {
        path: "src/utils/legacy.ts",
        content: "export function _deprecatedLegacyFormat() { return 'legacy'; }",
      },
    ];

    const proposals = engine.analyzeCodebase(files);
    expect(proposals.length).toBe(1);
    expect(proposals[0].detectedIssue).toBe("DEAD_CODE_EXPORT");
    expect(proposals[0].estimatedComplexityReduction).toBe(2);
  });
});
