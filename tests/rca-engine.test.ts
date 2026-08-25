import { describe, it, expect } from "vitest";
import { RootCauseAnalyzer } from "../src/remediation/rca-engine.js";
import { HotfixSynthesizer } from "../src/remediation/hotfix-synthesizer.js";

describe("RootCauseAnalyzer & HotfixSynthesizer (Milestone 12)", () => {
  const rca = new RootCauseAnalyzer();
  const synth = new HotfixSynthesizer();

  it("analyzes SQL injection incident and synthesizes parameterized hotfix", () => {
    const analysis = rca.analyzeIncident({
      id: "INC-SQL-01",
      title: "CWE-89 SQL Injection detected in invoice search",
      severity: "CRITICAL",
      source: "SECURITY_SCANNER",
      description: "Raw user input concatenated into SQL query string without parameters.",
      detectedAt: new Date().toISOString(),
    });

    expect(analysis.defectCategory).toBe("SQL_INJECTION");
    expect(analysis.confidenceScore).toBeGreaterThan(0.9);

    const patch = synth.synthesizeHotfix(analysis);
    expect(patch.gitBranch).toContain("hotfix/inc-inc-sql-01");
    expect(patch.patchDiff).toContain("$1");
    expect(patch.verificationTestCode).toContain("describe('SQL Injection Prevention Fixture'");
  });

  it("analyzes Latency Spike incident and synthesizes Redis caching hotfix", () => {
    const analysis = rca.analyzeIncident({
      id: "INC-PERF-01",
      title: "P99 Latency SLA breach in billing API",
      severity: "HIGH",
      source: "PROMETHEUS_SLO",
      description: "P99 latency breached 350ms threshold due to unindexed lookups.",
      detectedAt: new Date().toISOString(),
    });

    expect(analysis.defectCategory).toBe("LATENCY_SPIKE");
    const patch = synth.synthesizeHotfix(analysis);
    expect(patch.patchDiff).toContain("redis.get");
    expect(patch.verificationTestCode).toContain("Latency Mitigation Fixture");
  });
});
