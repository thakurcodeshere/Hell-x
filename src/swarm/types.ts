/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Multi-Agent Swarm Protocol & Topology Types
 */

import { Role } from "../core/types.js";

export interface SwarmAgentNode {
  agentId: string;
  role: Role;
  capabilities: string[];
  reputationScore: number;
  activeWorktreePath?: string;
  currentTaskId?: string;
  isAvailable: boolean;
}

export interface SwarmTopology {
  id: string;
  swarmName: string;
  coordinatorId: string;
  subswarms: {
    name: string;
    targetRole: Role;
    memberIds: string[];
  }[];
  activeAgents: SwarmAgentNode[];
}

export interface SwarmConsensusVote {
  proposalId: string;
  voterAgentId: string;
  voterRole: Role;
  vote: "APPROVE" | "REJECT" | "ABSTAIN";
  confidence: number;
  reasoning: string;
  timestamp: string;
}

export interface ConsensusProposal {
  id: string;
  title: string;
  proposalType: "TASK_REASSIGNMENT" | "ARCHITECTURE_MODIFICATION" | "HOTFIX_APPROVAL";
  proposedByAgentId: string;
  data: Record<string, any>;
  votes: SwarmConsensusVote[];
  quorumRequired: number;
  status: "OPEN" | "PASSED" | "REJECTED";
  createdAt: string;
}
