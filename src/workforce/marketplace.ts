/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Engineering Capability Marketplace & Agent Economy (Section 43 & 44)
 * Dynamic discovery, benchmark capability scoring and cost-weighted agent procurement.
 */

export interface AgentCapability {
  agentId: string;
  agentName: string;
  specialization: "FRONTEND_REACT" | "BACKEND_API" | "POSTGRES_OPTIMIZER" | "SECURITY_AUDITOR" | "MUTATION_TESTER" | "SRE_CHAOS";
  benchmarkAccuracyScore: number; // 0.0 - 1.0 (Empirical benchmark)
  costPer1kTokensUSD: number;
  averageTTRMs: number;
  verifiedTasksCompleted: number;
  isAvailable: boolean;
}

export class AgentMarketplace {
  private catalog: AgentCapability[] = [];

  constructor() {
    this.registerAgent({
      agentId: "agent-react-expert",
      agentName: "Titanium React & Tailwind Specialist",
      specialization: "FRONTEND_REACT",
      benchmarkAccuracyScore: 0.99,
      costPer1kTokensUSD: 0.003,
      averageTTRMs: 450,
      verifiedTasksCompleted: 142,
      isAvailable: true,
    });

    this.registerAgent({
      agentId: "agent-pg-optimizer",
      agentName: "PostgreSQL B-Tree & Indexing Master",
      specialization: "POSTGRES_OPTIMIZER",
      benchmarkAccuracyScore: 0.98,
      costPer1kTokensUSD: 0.0025,
      averageTTRMs: 380,
      verifiedTasksCompleted: 98,
      isAvailable: true,
    });

    this.registerAgent({
      agentId: "agent-sec-auditor",
      agentName: "SAST & Cryptographic Pen-Tester",
      specialization: "SECURITY_AUDITOR",
      benchmarkAccuracyScore: 0.99,
      costPer1kTokensUSD: 0.004,
      averageTTRMs: 520,
      verifiedTasksCompleted: 215,
      isAvailable: true,
    });

    this.registerAgent({
      agentId: "agent-mutation-tester",
      agentName: "AST Mutation Testing & Proof Verifier",
      specialization: "MUTATION_TESTER",
      benchmarkAccuracyScore: 0.97,
      costPer1kTokensUSD: 0.002,
      averageTTRMs: 310,
      verifiedTasksCompleted: 340,
      isAvailable: true,
    });
  }

  public registerAgent(agent: AgentCapability): void {
    this.catalog.push(agent);
  }

  public getCatalog(): AgentCapability[] {
    return [...this.catalog];
  }

  /**
   * Selects the optimal agent for a required specialization maximizing (Accuracy / Cost)
   */
  public selectBestAgent(specialization: AgentCapability["specialization"], maxBudgetUSD?: number): AgentCapability {
    const candidates = this.catalog.filter((a) => a.specialization === specialization && a.isAvailable);

    if (candidates.length === 0) {
      throw new Error(`No available agent in marketplace for specialization: ${specialization}`);
    }

    // Rank candidates by performance-to-cost ratio
    candidates.sort((a, b) => {
      const ratioA = a.benchmarkAccuracyScore / a.costPer1kTokensUSD;
      const ratioB = b.benchmarkAccuracyScore / b.costPer1kTokensUSD;
      return ratioB - ratioA;
    });

    return candidates[0];
  }
}
