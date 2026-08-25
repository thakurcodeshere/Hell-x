/**
 * Hell-x Tests: Self-Healing Autonomy Tiers (Step 08)
 */
import { describe, it, expect } from "vitest";
import { SelfHealingEngine } from "../src/remediation/self-healing-engine.js";
import { EngineeringOS } from "../src/core/engine.js";

describe("SelfHealingEngine — Tiered Autonomy L0-L5 (Step 08)", () => {
  it("resolves L0 (OBSERVE_ONLY) for FATAL incidents", async () => {
    const os = new EngineeringOS();
    await os.initialize();
    const engine = new SelfHealingEngine(os);
    const autonomy = engine.resolveAutonomyLevel({
      id: "INC-FATAL-001",
      title: "Full database corruption detected",
      severity: "FATAL",
      source: "MONITORING",
      description: "All tables corrupted",
      detectedAt: new Date().toISOString(),
    });
    expect(autonomy.level).toBe(0);
    expect(autonomy.action).toBe("OBSERVE_ONLY");
    expect(autonomy.humanApprovalRequired).toBe(true);
  });

  it("resolves L2 (PREPARE_PATCH) for CRITICAL incidents", async () => {
    const os = new EngineeringOS();
    await os.initialize();
    const engine = new SelfHealingEngine(os);
    const autonomy = engine.resolveAutonomyLevel({
      id: "INC-CRIT-001",
      title: "SQL injection in payment route",
      severity: "CRITICAL",
      source: "SECURITY_SCANNER",
      description: "SQL injection detected",
      detectedAt: new Date().toISOString(),
    });
    expect(autonomy.level).toBe(2);
    expect(autonomy.action).toBe("PREPARE_PATCH");
    expect(autonomy.humanApprovalRequired).toBe(true);
  });

  it("resolves L3 (AUTO_TEST) for MEDIUM incidents", async () => {
    const os = new EngineeringOS();
    await os.initialize();
    const engine = new SelfHealingEngine(os);
    const autonomy = engine.resolveAutonomyLevel({
      id: "INC-MED-001",
      title: "Memory leak in event subscriber",
      severity: "MEDIUM",
      source: "MONITORING",
      description: "Memory growing unbounded",
      detectedAt: new Date().toISOString(),
    });
    expect(autonomy.level).toBe(3);
    expect(autonomy.action).toBe("AUTO_TEST");
  });

  it("full remediation includes explicit MTTR_SIMULATION scope", async () => {
    const os = new EngineeringOS();
    await os.initialize();
    const engine = new SelfHealingEngine(os);
    const result = await engine.remediateIncident({
      id: "INC-LEAK-TEST",
      title: "Hardcoded API Key detected",
      severity: "CRITICAL",
      source: "SECURITY_SCANNER",
      description: "Found hardcoded Stripe key",
      detectedAt: new Date().toISOString(),
    });
    // CRITICAL → L2 PREPARE_PATCH: success=true, no canary promotion
    expect(result.success).toBe(true);
    expect(result.mttrScope).toBe("MTTR_SIMULATION");
    expect(result.autonomyLevelUsed).toBe(2);
    expect(result.humanApprovalRequired).toBe(true);
    expect(result.canaryPromotionPercentage).toBe(0); // L2 does NOT auto-canary
  }, 15000);

  it("LOW incident: prepares patch but does not auto-deploy", async () => {
    const os = new EngineeringOS();
    await os.initialize();
    const engine = new SelfHealingEngine(os);
    const autonomy = engine.resolveAutonomyLevel({
      id: "INC-LOW-001",
      title: "Deprecated endpoint still active",
      severity: "LOW",
      source: "MONITORING",
      description: "Endpoint /v1/legacy still active",
      detectedAt: new Date().toISOString(),
    });
    expect(autonomy.level).toBe(2);
    expect(autonomy.action).toBe("PREPARE_PATCH");
  });

  it("Benchmark disambiguation: MTTR is always marked MTTR_SIMULATION", async () => {
    const os = new EngineeringOS();
    await os.initialize();
    const engine = new SelfHealingEngine(os);
    const result = await engine.remediateIncident({
      id: "INC-BENCH-001",
      title: "Secret key detected",
      severity: "MEDIUM",
      source: "SECURITY_SCANNER",
      description: "Test for MTTR scope label",
      detectedAt: new Date().toISOString(),
    });
    // Must NEVER claim production MTTR from simulation
    expect(result.mttrScope).toBe("MTTR_SIMULATION");
    expect(result.mttrScope).not.toBe("MTTR_PRODUCTION");
  }, 15000);
});
