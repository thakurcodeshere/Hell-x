import { describe, it, expect } from "vitest";
import { SecurityScanner } from "../src/verification/security-scanner.js";

describe("SecurityScanner (Phase 5 / Section 18 & 27)", () => {
  const scanner = new SecurityScanner();

  it("detects hardcoded AWS and Stripe secrets with CWE classification", () => {
    const cleanFiles = [
      { path: "src/index.ts", content: "export const API_URL = process.env.API_URL;" },
    ];
    const cleanResult = scanner.scanFiles(cleanFiles);
    expect(cleanResult.passed).toBe(true);
    expect(cleanResult.vulnerabilities.length).toBe(0);

    const dirtyFiles = [
      { path: "src/config.ts", content: "const key = '" + "sk_test_" + "123456789012345678901234';" },
      { path: "src/aws.ts", content: "const awsKey = '" + "AKIA" + "1234567890ABCDEF';" },
    ];
    const dirtyResult = scanner.scanFiles(dirtyFiles);
    expect(dirtyResult.passed).toBe(false);
    expect(dirtyResult.vulnerabilities.length).toBe(2);
    expect(dirtyResult.vulnerabilities[0].cweCode).toBe("CWE-798");
  });
});
