/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Design Token & Visual System Engine
 */

import { DesignTokens } from "./types.js";

export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  colors: {
    primary: "#2563eb", // Blue 600
    secondary: "#475569", // Slate 600
    background: "#0f172a", // Slate 900
    surface: "#1e293b", // Slate 800
    text: "#f8fafc", // Slate 50
    textMuted: "#94a3b8", // Slate 400
    border: "#334155", // Slate 700
    error: "#ef4444", // Red 500
    success: "#10b981", // Emerald 500
    warning: "#f59e0b", // Amber 500
  },
  typography: {
    fontFamilySans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'Fira Code', monospace",
    fontSizeScale: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1.0rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
    },
    lineHeightScale: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
    fontWeightScale: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1.0rem",
    "6": "1.5rem",
    "8": "2.0rem",
    "12": "3.0rem",
  },
  radii: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
};

export class TokenEngine {
  private tokens: DesignTokens;

  constructor(customTokens?: Partial<DesignTokens>) {
    this.tokens = {
      ...DEFAULT_DESIGN_TOKENS,
      ...(customTokens || {}),
      colors: { ...DEFAULT_DESIGN_TOKENS.colors, ...(customTokens?.colors || {}) },
    };
  }

  public getTokens(): DesignTokens {
    return this.tokens;
  }

  public exportCssVariables(): string {
    const lines: string[] = [":root {"];
    for (const [k, v] of Object.entries(this.tokens.colors)) {
      lines.push(`  --color-${k}: ${v};`);
    }
    for (const [k, v] of Object.entries(this.tokens.spacing)) {
      lines.push(`  --space-${k}: ${v};`);
    }
    for (const [k, v] of Object.entries(this.tokens.radii)) {
      lines.push(`  --radius-${k}: ${v};`);
    }
    lines.push("}");
    return lines.join("\n");
  }

  /**
   * Calculates WCAG 2.1 relative luminance
   */
  private getLuminance(hex: string): number {
    const rgb = hex.replace("#", "").match(/.{1,2}/g)?.map((c) => parseInt(c, 16) / 255) || [0, 0, 0];
    const a = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  /**
   * Calculates WCAG 2.1 contrast ratio between two hex colors
   */
  public calculateContrastRatio(foregroundHex: string, backgroundHex: string): number {
    const l1 = this.getLuminance(foregroundHex);
    const l2 = this.getLuminance(backgroundHex);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
  }
}
