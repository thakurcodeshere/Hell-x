import { describe, it, expect } from "vitest";
import { AgentMarketplace } from "../src/workforce/marketplace.js";

describe("Engineering Capability Marketplace (Milestone 14 / Section 43 & 44)", () => {
  it("registers specialized agents and selects optimal candidates by benchmark-to-cost ratio", () => {
    const marketplace = new AgentMarketplace();
    const catalog = marketplace.getCatalog();

    expect(catalog.length).toBeGreaterThanOrEqual(4);

    const bestReact = marketplace.selectBestAgent("FRONTEND_REACT");
    expect(bestReact.agentId).toBe("agent-react-expert");
    expect(bestReact.benchmarkAccuracyScore).toBe(0.99);

    const bestSecurity = marketplace.selectBestAgent("SECURITY_AUDITOR");
    expect(bestSecurity.agentId).toBe("agent-sec-auditor");
    expect(bestSecurity.specialization).toBe("SECURITY_AUDITOR");
  });
});
