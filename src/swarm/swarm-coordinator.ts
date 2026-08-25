/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Multi-Agent Swarm Coordinator & Consensus Protocol Engine
 */

import { SwarmAgentNode, SwarmTopology, ConsensusProposal, SwarmConsensusVote } from "./types.js";
import { Role } from "../core/types.js";
import { EventBus } from "../storage/event-bus.js";
import { HellxError } from "../core/errors.js";

export class SwarmCoordinator {
  private topology: SwarmTopology;
  private proposals: Map<string, ConsensusProposal> = new Map();

  constructor(
    private eventBus: EventBus,
    swarmName: string = "Hellx-Core-Swarm"
  ) {
    this.topology = {
      id: `swarm-${Date.now()}`,
      swarmName,
      coordinatorId: "agent-swarm-lead",
      subswarms: [
        { name: "Architecture Subswarm", targetRole: "SYSTEM_ARCHITECT", memberIds: [] },
        { name: "Backend Subswarm", targetRole: "BACKEND_SPECIALIST", memberIds: [] },
        { name: "Frontend Subswarm", targetRole: "FRONTEND_SPECIALIST", memberIds: [] },
        { name: "QA Subswarm", targetRole: "QA_ENGINEER", memberIds: [] },
        { name: "SRE Subswarm", targetRole: "SRE", memberIds: [] },
      ],
      activeAgents: [],
    };
  }

  public registerAgent(agent: SwarmAgentNode): void {
    this.topology.activeAgents.push(agent);
    const subswarm = this.topology.subswarms.find((s) => s.targetRole === agent.role);
    if (subswarm) {
      subswarm.memberIds.push(agent.agentId);
    }
  }

  public getAvailableAgent(role: Role): SwarmAgentNode | undefined {
    return this.topology.activeAgents
      .filter((a) => a.role === role && a.isAvailable)
      .sort((a, b) => b.reputationScore - a.reputationScore)[0];
  }

  public getTopology(): SwarmTopology {
    return this.topology;
  }

  public createProposal(params: {
    title: string;
    proposalType: ConsensusProposal["proposalType"];
    proposedByAgentId: string;
    data: Record<string, any>;
    quorumRequired?: number;
  }): ConsensusProposal {
    const proposal: ConsensusProposal = {
      id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: params.title,
      proposalType: params.proposalType,
      proposedByAgentId: params.proposedByAgentId,
      data: params.data,
      votes: [],
      quorumRequired: params.quorumRequired || 2,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };

    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  public castVote(proposalId: string, vote: SwarmConsensusVote): ConsensusProposal {
    const prop = this.proposals.get(proposalId);
    if (!prop) {
      throw new HellxError(`Proposal '${proposalId}' not found`, "PROPOSAL_NOT_FOUND");
    }

    if (prop.status !== "OPEN") {
      throw new HellxError(`Proposal '${proposalId}' is already finalized (${prop.status})`, "PROPOSAL_FINALIZED");
    }

    prop.votes.push(vote);

    const approveVotes = prop.votes.filter((v) => v.vote === "APPROVE").length;
    const rejectVotes = prop.votes.filter((v) => v.vote === "REJECT").length;

    if (approveVotes >= prop.quorumRequired) {
      prop.status = "PASSED";
    } else if (rejectVotes >= prop.quorumRequired) {
      prop.status = "REJECTED";
    }

    return prop;
  }
}
