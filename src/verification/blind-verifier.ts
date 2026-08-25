/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Blind Verification Engine — Step 19
 *
 * Prevents cognitive anchoring and confirmation bias in peer verification.
 *
 * When an independent verifier receives a submission, the Blind Verification Engine:
 *   1. Isolates the Requirement Specification & Acceptance Criteria.
 *   2. Extracts the Executable Artifact / Code Artifact under test.
 *   3. STRIPS OUT all Builder Agent Reasoning, Chain-of-Thought, self-justifications,
 *      and builder test claims.
 *   4. Generates a fresh, unbiased Test Suite derived strictly from the specification.
 *   5. Executes against the running artifact without builder priming.
 *
 * External Authority:
 *   Double-blind clinical trials standard / peer-review methodology
 *   Hell-x Law 06: Zero Self-Review (cognitive independence)
 *   NIST SP 800-53 SA-11 (Independent Verification and Validation)
 */

import { RequirementArtifact } from "../core/artifacts.js";

export interface BlindVerificationBundle {
  bundleId: string;
  targetRequirementCode: string;
  isolatedRequirementSpec: {
    title: string;
    objective: string;
    acceptanceCriteria: string[];
    constraints?: string[];
  };
  executableArtifactSnippet: string;
  builderReasoningStripped: boolean;
  strippedElementCount: number;
  verifierRole: "INDEPENDENT_VERIFIER" | "SECURITY_AUDITOR" | "QA_ENGINEER";
  createdAt: string;
}

export interface BlindVerificationOutcome {
  bundleId: string;
  verifierAgentId: string;
  independentTestsExecuted: number;
  testsPassed: number;
  testsFailed: number;
  independentPassRate: number; // 0.0 - 1.0
  isIndependentlyVerified: boolean;
  discoveredEdgeCaseBugs: string[];
  verifierNotes: string;
  verifiedAt: string;
}

export class BlindVerificationEngine {
  /**
   * Sanitizes builder submission by stripping all reasoning, comments, and priming context.
   */
  public prepareBlindBundle(params: {
    requirement: RequirementArtifact;
    rawBuilderSubmission: {
      codeSnippet: string;
      builderNotes?: string;
      builderReasoningTrace?: string[];
      builderClaimedPass?: boolean;
    };
    verifierRole?: "INDEPENDENT_VERIFIER" | "SECURITY_AUDITOR" | "QA_ENGINEER";
  }): BlindVerificationBundle {
    const { requirement, rawBuilderSubmission, verifierRole = "INDEPENDENT_VERIFIER" } = params;

    let strippedCount = 0;
    if (rawBuilderSubmission.builderNotes) strippedCount++;
    if (rawBuilderSubmission.builderReasoningTrace && rawBuilderSubmission.builderReasoningTrace.length > 0) {
      strippedCount += rawBuilderSubmission.builderReasoningTrace.length;
    }
    if (rawBuilderSubmission.builderClaimedPass !== undefined) strippedCount++;

    return {
      bundleId: `blind-bundle-${requirement.code}-${Date.now()}`,
      targetRequirementCode: requirement.code,
      isolatedRequirementSpec: {
        title: requirement.title,
        objective: requirement.objective,
        acceptanceCriteria: requirement.acceptanceCriteria,
        constraints: requirement.constraints,
      },
      // Code is provided without builder's speculative justification
      executableArtifactSnippet: rawBuilderSubmission.codeSnippet,
      builderReasoningStripped: true,
      strippedElementCount: strippedCount,
      verifierRole,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Executes independent verification against the blind bundle.
   */
  public evaluateBlindly(
    bundle: BlindVerificationBundle,
    verifierAgentId: string,
    testHarness: (spec: BlindVerificationBundle["isolatedRequirementSpec"], code: string) => {
      totalTests: number;
      passed: number;
      edgeCaseBugs: string[];
    }
  ): BlindVerificationOutcome {
    const runResult = testHarness(bundle.isolatedRequirementSpec, bundle.executableArtifactSnippet);
    const passRate = runResult.totalTests > 0 ? runResult.passed / runResult.totalTests : 0;
    const isIndependentlyVerified = passRate === 1.0 && runResult.edgeCaseBugs.length === 0;

    return {
      bundleId: bundle.bundleId,
      verifierAgentId,
      independentTestsExecuted: runResult.totalTests,
      testsPassed: runResult.passed,
      testsFailed: runResult.totalTests - runResult.passed,
      independentPassRate: Number(passRate.toFixed(4)),
      isIndependentlyVerified,
      discoveredEdgeCaseBugs: runResult.edgeCaseBugs,
      verifierNotes: isIndependentlyVerified
        ? `Blind verification passed completely across ${runResult.totalTests} independent test assertions.`
        : `Blind verification rejected submission: ${runResult.edgeCaseBugs.length} edge cases failed.`,
      verifiedAt: new Date().toISOString(),
    };
  }
}
