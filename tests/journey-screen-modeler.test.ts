import { describe, it, expect } from "vitest";
import { JourneyModeler } from "../src/design/journey-modeler.js";
import { ScreenModeler } from "../src/design/screen-modeler.js";
import { RequirementArtifact } from "../src/core/artifacts.js";
import { APIEndpointContract } from "../src/blueprint/types.js";

describe("JourneyModeler & ScreenModeler (Phase 3)", () => {
  const req: RequirementArtifact = {
    id: "req-auth-01",
    type: "REQUIREMENT",
    code: "REQ-AUTH-001",
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: "pm-1",
    authorRole: "PRODUCT_MANAGER",
    title: "User Sign In",
    objective: "Allow existing users to sign in with email and password.",
    actor: "Registered User",
    trigger: "Click Login",
    preconditions: ["User exists"],
    workflow: ["Enter credentials", "Verify credentials", "Redirect to dashboard"],
    expectedResult: "User authenticated",
    edgeCases: [],
    constraints: [],
    acceptanceCriteria: [],
    verificationMethod: "E2E Test",
    riskLevel: "HIGH",
    completenessRadar: {
      functional: 0.9,
      ux: 0.9,
      data: 0.9,
      security: 0.9,
      operational: 0.9,
      errorHandling: 0.9,
      compliance: 0.9,
      observability: 0.9,
    },
    explicitUnknowns: [],
    status: "VALIDATED",
    dependencies: [],
    tags: ["auth"],
    immutable: true,
  };

  const api: APIEndpointContract = {
    id: "api-login",
    method: "POST",
    path: "/v1/auth/login",
    summary: "Login API",
    boundedContext: "AUTH",
    authRequired: false,
    requiredPermissions: [],
    parameters: [],
    responseSchemas: { 200: { type: "object" } },
    traceRequirementCodes: ["REQ-AUTH-001"],
  };

  it("synthesizes multi-step user journey from requirement workflow", () => {
    const journeyModeler = new JourneyModeler();
    const journeys = journeyModeler.modelJourneys([req]);

    expect(journeys.length).toBe(1);
    expect(journeys[0].steps.length).toBe(3);
    expect(journeys[0].steps[0].userGoal).toBe("Enter credentials");
    expect(journeys[0].steps[2].nextStepOnSuccess).toBe("COMPLETE");
  });

  it("synthesizes screen models and component hierarchies bound to API endpoints", () => {
    const screenModeler = new ScreenModeler();
    const screens = screenModeler.modelScreens([req], [api]);

    expect(screens.length).toBe(1);
    const screen = screens[0];
    expect(screen.components.some((c) => c.type === "BUTTON")).toBe(true);
    expect(screen.components.some((c) => c.type === "TEXT_INPUT")).toBe(true);

    const submitBtn = screen.components.find((c) => c.type === "BUTTON")!;
    expect(submitBtn.actions[0].apiBinding?.path).toBe("/v1/auth/login");
    expect(submitBtn.actions[0].errorRecoveryAction).toBeDefined();
  });
});
