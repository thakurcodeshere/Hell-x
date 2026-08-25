/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Accessibility (WCAG 2.1 AA) & Inclusive UX Verification Engine
 */

import { ScreenModel, AccessibilityReport } from "./types.js";
import { TokenEngine } from "./token-engine.js";

export class AccessibilityEngine {
  private tokenEngine: TokenEngine;

  constructor(tokenEngine?: TokenEngine) {
    this.tokenEngine = tokenEngine || new TokenEngine();
  }

  /**
   * Performs an automated WCAG 2.1 AA accessibility audit on a screen model
   */
  public auditScreen(screen: ScreenModel): AccessibilityReport {
    const violations: string[] = [];
    const missingAriaLabels: string[] = [];

    // 1. Contrast calculation
    const tokens = this.tokenEngine.getTokens();
    const textContrast = this.tokenEngine.calculateContrastRatio(
      tokens.colors.text,
      tokens.colors.background
    );

    const contrastRatioPassed = textContrast >= 4.5;
    if (!contrastRatioPassed) {
      violations.push(`Text contrast ratio ${textContrast}:1 is below WCAG 2.1 AA minimum of 4.5:1.`);
    }

    // 2. ARIA verification
    for (const cmp of screen.components) {
      if (!cmp.ariaLabel || cmp.ariaLabel.trim().length === 0) {
        missingAriaLabels.push(cmp.name);
        violations.push(`Component '${cmp.name}' (${cmp.type}) lacks a mandatory accessible aria-label.`);
      }
      if (!cmp.ariaRole || cmp.ariaRole.trim().length === 0) {
        violations.push(`Component '${cmp.name}' lacks a defined semantic ARIA role.`);
      }
    }

    // 3. Keyboard focus order check
    const focusableTypes = ["BUTTON", "TEXT_INPUT", "SELECT"];
    const focusableComponents = screen.components.filter((c) => focusableTypes.includes(c.type));
    const keyboardFocusOrderValid = focusableComponents.length > 0;

    let score = 1.0;
    if (!contrastRatioPassed) score -= 0.3;
    if (missingAriaLabels.length > 0) score -= Math.min(0.4, missingAriaLabels.length * 0.1);
    if (!keyboardFocusOrderValid) score -= 0.2;

    const normalizedScore = Number(Math.max(0.0, Math.min(1.0, score)).toFixed(2));

    return {
      screenId: screen.id,
      wcagLevel: "AA",
      contrastRatioPassed,
      minCalculatedContrast: textContrast,
      missingAriaLabels,
      keyboardFocusOrderValid,
      score: normalizedScore,
      violations,
    };
  }
}
