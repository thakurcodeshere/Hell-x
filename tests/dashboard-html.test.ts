import { describe, it, expect } from "vitest";
import { renderDashboardHtml } from "../src/server/dashboard-html.js";

describe("Dashboard HTML Synthesis (Milestone 10)", () => {
  it("renders the embedded Mission Control Web Dashboard with all tabs", () => {
    const html = renderDashboardHtml();

    expect(html).toContain("HELL-X");
    expect(html).toContain("Mission Control");
    expect(html).toContain("Task Graph (DAG)");
    expect(html).toContain("10D Spec Radar");
    expect(html).toContain("Evidence & Proofs");
    expect(html).toContain("Canary Rollout");
    expect(html).toContain("8-Tier Memory");
    expect(html).toContain("/api/v1/mission");
  });
});
