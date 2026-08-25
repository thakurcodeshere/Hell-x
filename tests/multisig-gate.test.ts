import { describe, it, expect } from "vitest";
import { RBACEngine } from "../src/identity/rbac-engine.js";
import { MultiSigGateEvaluator } from "../src/identity/multisig-gate.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";
import { EventBus } from "../src/storage/event-bus.js";
import { EvidenceArtifact } from "../src/core/artifacts.js";
import { MultiSigApprovalToken } from "../src/identity/types.js";

describe("Enterprise RBAC & Multi-Sig Dual Authorization Gate (Milestone 11)", () => {
  it("approves release when both automated evidence and authorized human lead sign", async () => {
    const rbac = new RBACEngine();
    rbac.registerTenant({
      id: "tenant-acme-corp",
      name: "Acme Corp",
      slug: "acme",
      allowedModels: ["gpt-4o", "claude-3-5-sonnet"],
      maxDailySpendUsd: 500,
      enforceMultiSigReleases: true,
      createdAt: new Date().toISOString(),
    });

    rbac.registerUser({
      id: "user-tech-lead-01",
      name: "Alex Rivera (Tech Lead)",
      tenantId: "tenant-acme-corp",
      role: "TECH_LEAD",
      isHuman: true,
      permissions: ["GATE_APPROVE_RELEASE"],
    });

    const store = new ArtifactStore();
    const bus = new EventBus();
    await bus.initialize();

    const evaluator = new MultiSigGateEvaluator(rbac, store, bus);

    const automatedEvidence: EvidenceArtifact = {
      id: "evid-auto-01",
      type: "EVIDENCE",
      code: "EVID-AUTO-001",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "agent-qa-01",
      authorRole: "QA_ENGINEER",
      evidenceType: "INTEGRATION_TEST_OUTPUT",
      targetRequirementCode: "REQ-PAYM-001",
      targetTaskId: "task-01",
      rawPayload: { testsPassed: 50 },
      reproducibleCommand: "npm test",
      verifiedPassed: true,
      verifierAgentId: "agent-qa-01",
      verifierModelIdentifier: "gpt-4o",
      verifierSignature: "627d976c1fcaeb01980f7d8c6b7593c66710ae13b28b6d80d2875ab912bb01c3",
      dependencies: [],
      tags: [],
      immutable: true,
    };

    const humanApprovalToken: MultiSigApprovalToken = {
      releaseId: "rel-01",
      gateCode: "GATE-MULTISIG-RELEASE-001",
      approverId: "user-tech-lead-01",
      approverRole: "TECH_LEAD",
      approverIsHuman: true,
      digitalSignature: "sig-human-lead-ecdsa-998822",
      approvedAt: new Date().toISOString(),
      justification: "Reviewed integration tests, verified PCI compliance and canary threshold.",
    };

    const decision = await evaluator.evaluateMultiSigRelease({
      gateCode: "GATE-MULTISIG-RELEASE-001",
      releaseId: "rel-01",
      automatedEvidence,
      humanApprovalToken,
      riskLevel: "CRITICAL",
    });

    expect(decision.status).toBe("PASSED");
    expect(decision.approvedByActorType).toBe("HUMAN");
    expect(decision.violations.length).toBe(0);
  });
});
