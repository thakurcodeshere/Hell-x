import { describe, it, expect } from "vitest";
import { VerificationGateEvaluator } from "../src/governance/verification-gate.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";
import { EventBus } from "../src/storage/event-bus.js";

describe("VerificationGateEvaluator (Layer 09 / Phase 5)", () => {
  it("approves verification gate when claims are proven, 0 security bugs, and mutation score >= 80%", async () => {
    const store = new ArtifactStore();
    await store.initialize();
    const bus = new EventBus();
    await bus.initialize();

    const gate = new VerificationGateEvaluator(store, bus);
    const result = await gate.evaluateVerificationReadiness({
      gateId: "gate-verif-01",
      targetRequirementCodes: ["REQ-PAYM-001"],
      claimDiscrepancyReport: {
        totalClaims: 3,
        provenClaims: 3,
        unprovenClaims: 0,
        discrepancies: [],
        allClaimsProven: true,
      },
      securityScanResult: {
        scannerName: "SAST",
        filesScanned: 10,
        vulnerabilities: [],
        passed: true,
        score: 1.0,
      },
      mutationReport: {
        totalMutants: 10,
        mutantsKilled: 9,
        mutantsSurvived: 1,
        mutationScore: 0.9,
        isAcceptable: true,
        mutants: [],
      },
      flakinessReport: {
        totalTestsEvaluated: 25,
        flakyTestsDetected: 0,
        quarantinedTests: [],
        suiteStabilityScore: 1.0,
      },
      evaluatorActor: {
        id: "qa-lead",
        name: "QA Lead",
        type: "SYSTEM_EVALUATOR",
        role: "QA_ENGINEER",
        permissions: ["GATE_APPROVE"],
      },
      justification: "100% claims proven with cryptographic evidence, 0 vulnerabilities, 90% mutation score.",
    });

    expect(result.status).toBe("PASSED");
    expect(result.violations.length).toBe(0);
  });
});
