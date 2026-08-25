import { describe, it, expect } from "vitest";
import { AgentTrustLedger } from "../src/reputation/agent-trust-ledger.js";

describe("Empirical Agent Trust & Reputation Ledger (Phase 15)", () => {
  it("tracks empirical track record, updates trust scores, and issues cryptographic credentials", () => {
    const ledger = new AgentTrustLedger();

    // 1. Initial Profile
    const initProfile = ledger.getProfile("agent-backend-01");
    expect(initProfile).toBeDefined();
    expect(initProfile?.reputationGrade).toBe("ELITE");

    // 2. Record clean verification pass
    const updated = ledger.recordTaskOutcome({
      agentId: "agent-backend-01",
      agentRole: "BACKEND_SPECIALIST",
      passedPeerVerification: true,
      causedEscapedDefect: false,
      caughtSecurityBug: true,
    });

    expect(updated.empiricalTrustScore).toBeGreaterThanOrEqual(0.95);
    expect(updated.reputationGrade).toBe("ELITE");

    // 3. Issue verifiable cryptographic credential
    const cred = ledger.issueCredential("agent-backend-01");
    expect(cred.agentId).toBe("agent-backend-01");
    expect(cred.credentialHash.length).toBe(64); // SHA-256
    expect(cred.reputationGrade).toBe("ELITE");

    // 4. Test penalty for escaped defect on a probation agent
    const penalized = ledger.recordTaskOutcome({
      agentId: "agent-buggy-junior",
      agentRole: "JUNIOR_CODER",
      passedPeerVerification: false,
      causedEscapedDefect: true,
      caughtSecurityBug: false,
    });

    expect(penalized.escapedDefectsPenalties).toBe(1);
    expect(penalized.empiricalTrustScore).toBeLessThan(0.75);
  });
});
