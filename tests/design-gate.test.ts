import { describe, it, expect } from "vitest";
import { DesignGateEvaluator } from "../src/governance/design-gate.js";
import { ArtifactStore } from "../src/storage/artifact-store.js";
import { EventBus } from "../src/storage/event-bus.js";
import { DesignContract } from "../src/design/types.js";
import { DEFAULT_DESIGN_TOKENS } from "../src/design/token-engine.js";

describe("DesignGateEvaluator (Layer 09 / UX Verification)", () => {
  it("approves design gate when all components have state machines and pass accessibility", async () => {
    const store = new ArtifactStore();
    await store.initialize();
    const bus = new EventBus();
    await bus.initialize();

    const contract: DesignContract = {
      id: "design-contract-01",
      projectId: "proj-01",
      version: 1,
      tokens: DEFAULT_DESIGN_TOKENS,
      journeys: [],
      screens: [
        {
          id: "screen-checkout-01",
          name: "CheckoutScreen",
          routePath: "/checkout",
          boundedContext: "PAYMENT",
          title: "Payment Checkout",
          layout: "SINGLE_COLUMN",
          components: [
            {
              id: "btn-pay",
              name: "PayButton",
              type: "BUTTON",
              label: "Pay",
              ariaRole: "button",
              ariaLabel: "Complete payment",
              defaultState: "IDLE",
              supportedStates: ["IDLE", "LOADING", "ERROR", "DISABLED"],
              actions: [
                { trigger: "CLICK", targetState: "LOADING", errorRecoveryAction: "Show retry banner" },
              ],
            },
          ],
          traceRequirementCodes: ["REQ-PAYM-001"],
          traceApiContractIds: ["api-post-payments"],
        },
      ],
      accessibilityScore: 0.95,
      traceRequirementCodes: ["REQ-PAYM-001"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const gate = new DesignGateEvaluator(store, bus);
    const result = await gate.evaluateDesignReadiness({
      gateId: "gate-design-001",
      contract,
      evaluatorActor: {
        id: "lead-designer",
        name: "Lead Product Designer",
        type: "SYSTEM_EVALUATOR",
        role: "UX_DESIGNER",
        permissions: ["GATE_APPROVE"],
      },
      justification: "100% component state machine coverage and WCAG 2.1 AA accessibility score.",
    });

    expect(result.status).toBe("PASSED");
    expect(result.violations.length).toBe(0);
  });
});
