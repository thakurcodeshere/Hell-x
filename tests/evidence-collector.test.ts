import { describe, it, expect } from "vitest";
import { EvidenceCollector } from "../src/verification/evidence-collector.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";
import { EventBus } from "../src/storage/event-bus.js";

describe("EvidenceCollector (Phase 5 / Section 18)", () => {
  it("captures, cryptographically hashes, and stores evidence artifacts", async () => {
    const store = new ArtifactStore();
    await store.initialize();
    const bus = new EventBus();
    await bus.initialize();

    const collector = new EvidenceCollector(store, bus);
    const evidence = await collector.captureEvidence({
      evidenceType: "UNIT_TEST_OUTPUT",
      targetRequirementCode: "REQ-PAYM-001",
      targetTaskId: "task-01",
      rawPayload: { testsPassed: 12, assertions: 48, durationMs: 124 },
      reproducibleCommand: "npm test tests/unit/payment.test.ts",
      verifiedPassed: true,
      verifierId: "agent-qa-01",
      verifierRole: "QA_ENGINEER",
    });

    expect(evidence.id).toBeDefined();
    expect(evidence.verifierSignature.length).toBe(64); // SHA-256
    expect(evidence.verifiedPassed).toBe(true);
    expect(store.getByCode(evidence.code)?.id).toBe(evidence.id);
  });
});
