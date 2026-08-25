import { describe, it, expect } from "vitest";
import { AccessibilityEngine } from "../src/design/a11y-engine.js";
import { ScreenModel } from "../src/design/types.js";

describe("AccessibilityEngine (WCAG 2.1 AA Compliance)", () => {
  const a11yEngine = new AccessibilityEngine();

  it("audits screen for contrast, semantic roles, and ARIA labels", () => {
    const screen: ScreenModel = {
      id: "screen-test-01",
      name: "Dashboard",
      routePath: "/dashboard",
      boundedContext: "CORE",
      title: "Main Dashboard",
      layout: "SINGLE_COLUMN",
      components: [
        {
          id: "c1",
          name: "ActionBtn",
          type: "BUTTON",
          label: "Execute",
          ariaRole: "button",
          ariaLabel: "Execute main task",
          defaultState: "IDLE",
          supportedStates: ["IDLE"],
          actions: [],
        },
      ],
      traceRequirementCodes: ["REQ-001"],
      traceApiContractIds: [],
    };

    const report = a11yEngine.auditScreen(screen);
    expect(report.contrastRatioPassed).toBe(true);
    expect(report.missingAriaLabels.length).toBe(0);
    expect(report.score).toBeGreaterThanOrEqual(0.9);
  });
});
