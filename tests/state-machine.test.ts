import { describe, it, expect } from "vitest";
import { InteractionStateMachine } from "../src/design/state-machine.js";
import { UIComponent } from "../src/design/types.js";

describe("InteractionStateMachine (Zero-Decoration Interaction Law)", () => {
  const stateMachine = new InteractionStateMachine();

  it("validates button has required loading, error, and recovery mechanisms", () => {
    const validBtn: UIComponent = {
      id: "btn-pay",
      name: "PayButton",
      type: "BUTTON",
      label: "Pay Now",
      ariaRole: "button",
      ariaLabel: "Pay Now Button",
      defaultState: "IDLE",
      supportedStates: ["IDLE", "LOADING", "ERROR", "DISABLED", "SUCCESS"],
      actions: [
        { trigger: "CLICK", targetState: "LOADING", errorRecoveryAction: "Show retry modal" },
      ],
    };

    const check = stateMachine.validateComponentStateMachine(validBtn);
    expect(check.valid).toBe(true);
    expect(check.violations.length).toBe(0);
  });

  it("flags button lacking mandatory error and recovery states", () => {
    const invalidBtn: UIComponent = {
      id: "btn-naive",
      name: "NaiveButton",
      type: "BUTTON",
      label: "Click Me",
      ariaRole: "button",
      ariaLabel: "Click Me",
      defaultState: "IDLE",
      supportedStates: ["IDLE"], // Missing LOADING, ERROR, DISABLED
      actions: [{ trigger: "CLICK", targetState: "IDLE" }], // No recovery
    };

    const check = stateMachine.validateComponentStateMachine(invalidBtn);
    expect(check.valid).toBe(false);
    expect(check.missingStates).toContain("LOADING");
    expect(check.missingStates).toContain("ERROR");
  });

  it("simulates deterministic state transitions", () => {
    const btn: UIComponent = {
      id: "btn-submit",
      name: "SubmitButton",
      type: "BUTTON",
      label: "Submit",
      ariaRole: "button",
      ariaLabel: "Submit Button",
      defaultState: "IDLE",
      supportedStates: ["IDLE", "LOADING", "SUCCESS", "ERROR", "DISABLED"],
      actions: [
        { trigger: "CLICK", targetState: "LOADING", errorRecoveryAction: "Retry" },
      ],
    };

    const res = stateMachine.transition(btn, "IDLE", "CLICK");
    expect(res.valid).toBe(true);
    expect(res.toState).toBe("LOADING");
    expect(res.recoveryAction).toBe("Retry");
  });
});
