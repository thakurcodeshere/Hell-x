import { describe, it, expect } from "vitest";
import { SwarmCoordinator } from "../src/swarm/swarm-coordinator.js";
import { EventBus } from "../src/storage/event-bus.js";

describe("SwarmCoordinator & Consensus Protocol (Milestone 12)", () => {
  it("registers agents across subswarms and achieves quorum on proposals", async () => {
    const bus = new EventBus();
    await bus.initialize();

    const coordinator = new SwarmCoordinator(bus);

    coordinator.registerAgent({
      agentId: "agent-backend-01",
      role: "BACKEND_SPECIALIST",
      capabilities: ["NODEJS", "SQL", "API"],
      reputationScore: 0.95,
      isAvailable: true,
    });

    coordinator.registerAgent({
      agentId: "agent-qa-01",
      role: "QA_ENGINEER",
      capabilities: ["TEST_SUITE", "MUTATION"],
      reputationScore: 0.98,
      isAvailable: true,
    });

    const topo = coordinator.getTopology();
    expect(topo.activeAgents.length).toBe(2);

    const available = coordinator.getAvailableAgent("BACKEND_SPECIALIST");
    expect(available?.agentId).toBe("agent-backend-01");

    // Create Proposal
    const proposal = coordinator.createProposal({
      title: "Hotfix Consensus for Billing Idempotency",
      proposalType: "HOTFIX_APPROVAL",
      proposedByAgentId: "agent-sre-01",
      data: { patchId: "patch-01" },
      quorumRequired: 2,
    });

    expect(proposal.status).toBe("OPEN");

    // Vote 1
    coordinator.castVote(proposal.id, {
      proposalId: proposal.id,
      voterAgentId: "agent-backend-01",
      voterRole: "BACKEND_SPECIALIST",
      vote: "APPROVE",
      confidence: 1.0,
      reasoning: "Patch logic is sound",
      timestamp: new Date().toISOString(),
    });

    // Vote 2 (Reaches Quorum)
    const finalized = coordinator.castVote(proposal.id, {
      proposalId: proposal.id,
      voterAgentId: "agent-qa-01",
      voterRole: "QA_ENGINEER",
      vote: "APPROVE",
      confidence: 0.99,
      reasoning: "All regression tests pass",
      timestamp: new Date().toISOString(),
    });

    expect(finalized.status).toBe("PASSED");
    expect(finalized.votes.length).toBe(2);
  });
});
