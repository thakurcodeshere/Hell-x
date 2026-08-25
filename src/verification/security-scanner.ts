/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Security Vulnerability & Secret Leak Scanner (Section 18 & 27)
 */

import { SecurityScanResult, SecurityVulnerability } from "./types.js";

export class SecurityScanner {
  private secretPatterns = [
    { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/i, cwe: "CWE-798" },
    { name: "Stripe Secret Key", regex: /sk_(live|test)_[0-9a-zA-Z]{24}/i, cwe: "CWE-798" },
    { name: "Generic Secret String", regex: /(password|secret|api_key|private_key)\s*=\s*['"][a-zA-Z0-9_\-]{16,}['"]/i, cwe: "CWE-798" },
    { name: "Unchecked JWT Insecure Decode", regex: /jwt\.decode\([^,)]+,\s*\{\s*verify:\s*false\s*\}\)/i, cwe: "CWE-347" },
    { name: "Raw SQL String Interpolation", regex: /SELECT\s+.*FROM\s+.*\$\{[a-zA-Z0-9_]+\}/i, cwe: "CWE-89" },
  ];

  /**
   * Scans a set of file contents for security vulnerabilities
   */
  public scanFiles(files: { path: string; content: string }[]): SecurityScanResult {
    const vulnerabilities: SecurityVulnerability[] = [];

    for (const file of files) {
      const lines = file.content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        for (const pattern of this.secretPatterns) {
          if (pattern.regex.test(line)) {
            vulnerabilities.push({
              id: `vuln-${Date.now()}-${vulnerabilities.length + 1}`,
              cweCode: pattern.cwe,
              severity: pattern.cwe === "CWE-798" || pattern.cwe === "CWE-89" ? "CRITICAL" : "HIGH",
              title: pattern.name,
              description: `Potential security vulnerability detected: ${pattern.name} at line ${i + 1}.`,
              filePath: file.path,
              lineNumber: i + 1,
              remediationGuidance: `Isolate sensitive credentials in KMS/environment variables and sanitize dynamic query inputs.`,
            });
          }
        }
      }
    }

    const passed = vulnerabilities.filter((v) => v.severity === "CRITICAL" || v.severity === "HIGH").length === 0;
    const score = Number(Math.max(0.0, 1.0 - vulnerabilities.length * 0.25).toFixed(2));

    return {
      scannerName: "Hell-x Static Security & Secret Auditor",
      filesScanned: files.length,
      vulnerabilities,
      passed,
      score,
    };
  }
}
