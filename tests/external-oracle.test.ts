import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import { ExternalTruthOracle } from "../src/verification/external-oracle.js";

describe("External Ground-Truth Verification Oracle (Phase 15)", () => {
  it("validates external truth across AST parser, process exit codes, and SHA-256 hashes", () => {
    const oracle = new ExternalTruthOracle();

    // 1. AST Validation
    const astPass = oracle.verifySyntax("export function calculateTotal(a: number, b: number): number { return a + b; }");
    expect(astPass.isVerifiedTrue).toBe(true);

    const astFail = oracle.verifySyntax("export function SYNTAX_ERROR_UNEXPECTED_TOKEN {");
    expect(astFail.isVerifiedTrue).toBe(false);

    // 2. Process Execution Verification
    const procPass = oracle.verifyProcessExecution(0, "✓ 94 tests passed (94)");
    expect(procPass.isVerifiedTrue).toBe(true);

    const procFail = oracle.verifyProcessExecution(1, "Fatal error: Segmentation fault in AST worker");
    expect(procFail.isVerifiedTrue).toBe(false);

    // 3. Cryptographic Hash Provenance
    const payload = { requirement: "REQ-001", status: "VERIFIED" };
    const expectedHash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    const cryptoPass = oracle.verifyPayloadHash(payload, expectedHash);
    expect(cryptoPass.isVerifiedTrue).toBe(true);

    // 4. Mathematical Invariant Verification
    const invPass = oracle.verifyInvariant("amountCents > 0 && tenantId.length > 0", 1500 > 0 && "tenant-acme".length > 0);
    expect(invPass.isVerifiedTrue).toBe(true);
  });
});
