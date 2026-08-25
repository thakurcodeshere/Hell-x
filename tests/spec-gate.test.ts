import { describe, it, expect } from "vitest";
import { SpecificationGateEvaluator } from "../src/governance/spec-gate.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";
import { EventBus } from "../src/storage/event-bus.js";
import { RequirementArtifact } from "../src/core/artifacts.js";

describe("SpecificationGateEvaluator (Layer 09)", () => {
  it("approves specification gate when requirements achieve completeness threshold and zero conflicts", async () => {
    const store = new ArtifactStore();
    await store.initialize();
    const bus = new EventBus();
    await bus.initialize();

    const validReq: RequirementArtifact = {
      id: "req-spec-gate-01",
      type: "REQUIREMENT",
      code: "REQ-AUTH-099",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "pm-1",
      authorRole: "PRODUCT_MANAGER",
      title: "OAuth2 Provider Authorization Flow",
      objective: "Provide secure authorization code exchange for client applications.",
      actor: "Client Application",
      trigger: "GET /oauth/authorize",
      preconditions: ["Client ID is registered", "Redirect URI matches whitelist"],
      workflow: [
        "Validate client registration and redirect URI",
        "Prompt user for consent and credentials",
        "Issue short-lived authorization code",
      ],
      expectedResult: "Redirect client with authorization code.",
      edgeCases: [
        "Invalid redirect URI returns HTTP 400 Bad Request",
        "Expired consent session restarts auth flow",
      ],
      constraints: [
        "Authorization code must expire within 60 seconds",
        "PKCE code_challenge verification is strictly enforced",
      ],
      acceptanceCriteria: [
        "AC1: Valid code exchange returns JWT access token",
        "AC2: Replayed authorization code revokes entire grant",
      ],
      verificationMethod: "RFC 7636 OAuth Test Suite",
      riskLevel: "HIGH",
      completenessRadar: {
        functional: 0.95,
        ux: 0.85,
        data: 0.9,
        security: 0.95,
        operational: 0.9,
        errorHandling: 0.9,
        compliance: 0.9,
        observability: 0.9,
      },
      explicitUnknowns: [],
      status: "VALIDATED",
      dependencies: [],
      tags: ["oauth", "auth"],
      immutable: true,
    };

    await store.put(validReq);

    const gateEvaluator = new SpecificationGateEvaluator(store, bus);
    const result = await gateEvaluator.evaluateSpecificationReadiness({
      gateId: "gate-spec-test-01",
      requirementCodes: ["REQ-AUTH-099"],
      evaluatorActor: {
        id: "architect-01",
        name: "Lead Architect",
        type: "SYSTEM_EVALUATOR",
        role: "SYSTEM_ARCHITECT",
        permissions: ["GATE_APPROVE"],
      },
      justification: "Requirement REQ-AUTH-099 exceeds 90% completeness with zero conflicts.",
    });

    expect(result.status).toBe("PASSED");
    expect(result.violations.length).toBe(0);
  });
});
