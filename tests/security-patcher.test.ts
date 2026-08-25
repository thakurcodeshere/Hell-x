import { describe, it, expect } from "vitest";
import { SecurityPatcher } from "../src/mission/security-patcher.js";
import { SecurityVulnerability } from "../src/verification/types.js";

describe("SecurityPatcher (Phase 8 / Section 38)", () => {
  const patcher = new SecurityPatcher();

  it("generates automated security patch proposals and test fixtures", () => {
    const vulns: SecurityVulnerability[] = [
      {
        id: "vuln-1",
        cweCode: "CWE-798",
        severity: "CRITICAL",
        title: "Hardcoded API Key",
        description: "const key = 'sk_live_1234';",
        filePath: "src/config.ts",
        remediationGuidance: "Use process.env",
      },
    ];

    const patches = patcher.generatePatches(vulns);
    expect(patches.length).toBe(1);
    expect(patches[0].cweCode).toBe("CWE-798");
    expect(patches[0].patchedCode).toContain("process.env.API_SECRET_KEY");
    expect(patches[0].verificationTestCode).toContain("Security Regression");
  });
});
