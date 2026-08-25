import { describe, it, expect } from "vitest";
import { SelfHealingEngine } from "../src/remediation/self-healing-engine.js";
import { EngineeringOS } from "../src/core/engine.js";

describe("SelfHealingEngine Closed-Loop Remediation (Milestone 12)", () => {
  it("executes end-to-end self-healing remediation from incident report", async () => {
    const os = new EngineeringOS();
    await os.initialize();

    const engine = new SelfHealingEngine(os);

    const result = await engine.remediateIncident({
      id: "INC-LEAK-01",
      title: "Hardcoded API Key secret detected in config",
      severity: "CRITICAL",
      source: "SECURITY_SCANNER",
      description: "Found hardcoded Stripe API secret token in src/config/secrets.ts",
      detectedAt: new Date().toISOString(),
    });

    expect(result.success).toBe(true);
    expect(result.canaryPromotionPercentage).toBe(100);
    expect(result.mutationKillScore).toBe(88);
    expect(result.slsaProvenanceHash.length).toBe(64);
    expect(result.distilledRuleCode).toContain("RULE-PREVENT-SECRET_LEAK");

    // Verify stored memory artifact
    const memories = os.artifactStore.getByType("MEMORY");
    const failMem = memories.find((m) => m.code === "MEM-FAIL-INC-LEAK-01");
    expect(failMem).toBeDefined();
    expect(failMem?.type).toBe("MEMORY");
  }, 15000);
});
