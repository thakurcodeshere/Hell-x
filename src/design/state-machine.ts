/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Deterministic Interaction State Machine & Transition Validator
 */

import { UIComponent, ComponentState } from "./types.js";
import { HellxError } from "../core/errors.js";

export interface StateTransitionResult {
  fromState: ComponentState;
  toState: ComponentState;
  valid: boolean;
  recoveryAction?: string;
  error?: string;
}

export class InteractionStateMachine {
  /**
   * Validates that a component strictly implements required states and error recovery
   */
  public validateComponentStateMachine(component: UIComponent): {
    valid: boolean;
    missingStates: string[];
    violations: string[];
  } {
    const violations: string[] = [];
    const missingStates: string[] = [];

    // Interactive components must support error handling and loading
    if (component.type === "BUTTON") {
      const requiredButtonStates: ComponentState[] = ["IDLE", "LOADING", "ERROR", "DISABLED"];
      for (const st of requiredButtonStates) {
        if (!component.supportedStates.includes(st)) {
          missingStates.push(st);
          violations.push(`Interactive component '${component.name}' (${component.type}) is missing mandatory state '${st}'.`);
        }
      }

      // Must have at least one action with error recovery
      const hasErrorRecovery = component.actions.some((a) => a.errorRecoveryAction && a.errorRecoveryAction.length > 0);
      if (!hasErrorRecovery) {
        violations.push(`Interactive component '${component.name}' lacks a defined error recovery mechanism.`);
      }
    }

    if (component.type === "TEXT_INPUT") {
      const requiredInputStates: ComponentState[] = ["IDLE", "ACTIVE", "ERROR"];
      for (const st of requiredInputStates) {
        if (!component.supportedStates.includes(st)) {
          missingStates.push(st);
          violations.push(`Input component '${component.name}' is missing state '${st}'.`);
        }
      }
    }

    return {
      valid: violations.length === 0,
      missingStates,
      violations,
    };
  }

  /**
   * Simulates a state transition for a component
   */
  public transition(
    component: UIComponent,
    currentState: ComponentState,
    trigger: "CLICK" | "INPUT" | "SUBMIT" | "BLUR" | "HOVER" | "FOCUS"
  ): StateTransitionResult {
    const action = component.actions.find((a) => a.trigger === trigger);
    if (!action) {
      return {
        fromState: currentState,
        toState: currentState,
        valid: false,
        error: `No action defined for trigger '${trigger}' on component '${component.name}'.`,
      };
    }

    if (!component.supportedStates.includes(action.targetState)) {
      return {
        fromState: currentState,
        toState: currentState,
        valid: false,
        error: `Target state '${action.targetState}' is not supported by component '${component.name}'.`,
      };
    }

    return {
      fromState: currentState,
      toState: action.targetState,
      valid: true,
      recoveryAction: action.errorRecoveryAction,
    };
  }
}
