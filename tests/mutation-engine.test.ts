import { describe, it, expect } from "vitest";
import { MutationEngine } from "../src/verification/mutation-engine.js";

describe("MutationEngine (Phase 5 / Section 21)", () => {
  const engine = new MutationEngine();

  it("generates synthetic code mutations from source code snippets", () => {
    const code = `
      function canExecute(riskLevel, userRole) {
        if (riskLevel === "CRITICAL") return false;
        if (userRole > 2) return item;
        return true;
      }
    `;

    const mutants = engine.generateMutations("src/auth.ts", code);
    expect(mutants.length).toBeGreaterThanOrEqual(3);
    expect(mutants.some((m) => m.mutationType === "CONDITION_INVERSION")).toBe(true);
    expect(mutants.some((m) => m.mutationType === "BOUNDARY_OFF_BY_ONE")).toBe(true);
    expect(mutants.some((m) => m.mutationType === "RETURN_VALUE_TAMPER")).toBe(true);
  });

  it("evaluates mutation kill score accurately", () => {
    const mutants = [
      { id: "m1", sourceFile: "a.ts", originalCodeSnippet: "==", mutatedCodeSnippet: "!=", mutationType: "CONDITION_INVERSION" as const, killed: false },
      { id: "m2", sourceFile: "a.ts", originalCodeSnippet: ">", mutatedCodeSnippet: "<=", mutationType: "BOUNDARY_OFF_BY_ONE" as const, killed: false },
    ];

    const report = engine.evaluateMutationTesting(mutants, 1.0); // 100% kill rate
    expect(report.mutantsKilled).toBe(2);
    expect(report.mutationScore).toBe(1.0);
    expect(report.isAcceptable).toBe(true);
  });
});
