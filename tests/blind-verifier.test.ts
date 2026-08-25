/**
 * Hell-x Tests: Blind Verification Engine (Step 19)
 */
import { describe, it, expect } from "vitest";
import { BlindVerificationEngine } from "../src/verification/blind-verifier.js";
import { RequirementArtifact } from "../src/core/artifacts.js";

describe("BlindVerificationEngine — Cognitive De-Anchoring & Unbiased Verification (Step 19)", () => {
  const req: RequirementArtifact = {
    id: "art-req-01",
    type: "REQUIREMENT",
    code: "REQ-AUTH-01",
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: "agent-pm",
    authorRole: "PRODUCT_MANAGER",
    title: "User Password Reset Token Generation",
    objective: "Generates a cryptographically random 32-byte token expiring in 15 minutes.",
    actor: "End User",
    trigger: "Forgot Password Clicked",
    preconditions: ["User exists"],
    workflow: ["Verify user", "Generate token", "Send email"],
    expectedResult: "Token generated and emailed",
    edgeCases: ["Non-existent user", "Expired session"],
    constraints: ["Rate limit 3 requests per hour"],
    acceptanceCriteria: [
      "Token length must be exactly 64 hex characters",
      "Token must not be deterministic or predictable",
      "Must throw on invalid user ID",
    ],
    verificationMethod: "AUTOMATED_UNIT_TEST",
    riskLevel: "MEDIUM",
    completenessRadar: {
      functional: 1, ux: 1, data: 1, security: 1, operational: 1,
      errorHandling: 1, compliance: 1, observability: 1,
    },
    explicitUnknowns: [],
    dependencies: [],
    tags: ["auth", "security"],
    immutable: true,
  };

  it("strips out builder CoT reasoning and self-serving pass declarations", () => {
    const engine = new BlindVerificationEngine();
    const bundle = engine.prepareBlindBundle({
      requirement: req,
      rawBuilderSubmission: {
        codeSnippet: "function generateToken(userId) { if(!userId) throw new Error('invalid'); return crypto.randomBytes(32).toString('hex'); }",
        builderNotes: "I verified this personally and it works 100% reliably.",
        builderReasoningTrace: [
          "Step 1: Check user input",
          "Step 2: Generate random crypto bytes",
          "Step 3: Test passed on my machine",
        ],
        builderClaimedPass: true,
      },
    });

    expect(bundle.builderReasoningStripped).toBe(true);
    expect(bundle.strippedElementCount).toBe(5); // 1 notes + 3 trace steps + 1 claimedPass
    expect(bundle.executableArtifactSnippet).toContain("crypto.randomBytes");
    expect(bundle.isolatedRequirementSpec.acceptanceCriteria.length).toBe(3);
  });

  it("evaluates blind bundle with independent test harness without bias", () => {
    const engine = new BlindVerificationEngine();
    const bundle = engine.prepareBlindBundle({
      requirement: req,
      rawBuilderSubmission: {
        codeSnippet: "function generateToken(userId) { return 'dummy-token-12345'; }",
        builderNotes: "Trust me it passes.",
      },
    });

    // Independent test harness checks spec criteria
    const outcome = engine.evaluateBlindly(bundle, "agent-qa-blind", (spec, code) => {
      const edgeCases: string[] = [];
      let passed = 0;
      const total = spec.acceptanceCriteria.length;

      // Check 1: 64 hex characters
      if (code.includes("32") && code.includes("hex")) {
        passed++;
      } else {
        edgeCases.push("Failed acceptance criterion: Token is not 64 hex chars.");
      }

      // Check 2: Invalid user id handling
      if (code.includes("throw")) {
        passed++;
      } else {
        edgeCases.push("Failed acceptance criterion: Does not throw on invalid user ID.");
      }

      return { totalTests: total, passed, edgeCaseBugs: edgeCases };
    });

    expect(outcome.isIndependentlyVerified).toBe(false);
    expect(outcome.discoveredEdgeCaseBugs.length).toBeGreaterThan(0);
    expect(outcome.verifierNotes).toContain("rejected submission");
  });
});
