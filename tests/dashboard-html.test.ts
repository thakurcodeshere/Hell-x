import { describe, it, expect } from "vitest";
import { renderDashboardHtml } from "../src/server/dashboard-html.js";

describe("Dashboard HTML Synthesis (12-View Engineering Control Plane)", () => {
  it("renders the embedded Mission Control Web Dashboard with 12-view control plane", () => {
    const html = renderDashboardHtml();

    expect(html).toContain("HELL-X");
    expect(html).toContain("Command Center");
    expect(html).toContain("Intent & 10D Radar");
    expect(html).toContain("Engineering Model");
    expect(html).toContain("Work Graph (DAG)");
    expect(html).toContain("Agent Workforce");
    expect(html).toContain("Evidence Network");
    expect(html).toContain("Verification & Proofs");
    expect(html).toContain("Releases & Canary");
    expect(html).toContain("Observability (RED)");
    expect(html).toContain("8-Tier Memory");
    expect(html).toContain("Decisions (ADRs)");
    expect(html).toContain("Learning & Swarm");
    expect(html).toContain("/api/v1/mission");
  });
});
