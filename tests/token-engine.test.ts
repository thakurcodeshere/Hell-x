import { describe, it, expect } from "vitest";
import { TokenEngine } from "../src/design/token-engine.js";

describe("TokenEngine (Layer 04 / Design System)", () => {
  const tokenEngine = new TokenEngine();

  it("exports CSS custom properties for color, spacing, and radius scales", () => {
    const css = tokenEngine.exportCssVariables();
    expect(css).toContain(":root {");
    expect(css).toContain("--color-primary:");
    expect(css).toContain("--space-4:");
    expect(css).toContain("--radius-md:");
  });

  it("calculates WCAG 2.1 contrast ratio accurately", () => {
    // White (#ffffff) on Dark Slate (#0f172a) has high contrast > 10:1
    const contrast = tokenEngine.calculateContrastRatio("#ffffff", "#0f172a");
    expect(contrast).toBeGreaterThan(10.0);

    // Dark grey on black has low contrast < 3:1
    const lowContrast = tokenEngine.calculateContrastRatio("#222222", "#000000");
    expect(lowContrast).toBeLessThan(3.0);
  });
});
