/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Agent Capability Graph — Step 09
 *
 * Replaces the fixed 7-persona model with dynamic capability vectors.
 * Task assignment becomes an optimization problem:
 *   maximize(capability_fit × reliability) / cost
 * subject to:
 *   agent.riskClearance >= task.riskClass
 *
 * External Authority:
 *   Hell-x Law 13: Meritocratic agent selection based on empirical benchmark reputation
 *   Hell-x Law 14: Adaptive Workflows
 *   NIST SP 800-53 AC-6 (Least Privilege)
 */

export type RiskClearanceLevel = "R0" | "R1" | "R2" | "R3" | "R4" | "R5";

export interface AgentCapabilityVector {
  /** e.g. "postgresql", "typescript", "react", "payments-api", "security-analysis" */
  [domain: string]: number; // 0.0 – 1.0
}

export interface AgentHistoricalMetrics {
  tasksAttempted: number;
  successRate: number;           // 0.0 – 1.0
  defectRate: number;            // escaped defects per 100 tasks
  mutationKillRate: number;      // 0.0 – 1.0
  firstPassVerificationRate: number; // approved without rework
  rollbacksTriggered: number;
  averageCostPerKToken: number;  // USD
  averageLatencyMs: number;
  humanInterventionRate: number; // how often human had to step in
}

export interface AgentCapabilityProfile {
  agentId: string;
  displayName: string;
  primaryRole: string;
  capabilities: AgentCapabilityVector;
  metrics: AgentHistoricalMetrics;
  riskClearanceLevel: RiskClearanceLevel;
  modelIdentifier: string;
  isAvailable: boolean;
  lastUpdatedAt: string;
}

export interface TaskAssignmentRequest {
  taskId: string;
  requiredCapabilities: AgentCapabilityVector;  // minimum scores
  riskClass: RiskClearanceLevel;
  maxCostPerKToken?: number;
  preferLowLatency?: boolean;
}

export interface AssignmentResult {
  taskId: string;
  assignedAgentId: string;
  fitScore: number;        // 0.0 – 1.0 composite fitness
  reliabilityScore: number;
  costScore: number;
  capabilityMatchScore: number;
  riskClearanceAdequate: boolean;
  explanation: string;
}

const RISK_ORDER: RiskClearanceLevel[] = ["R0", "R1", "R2", "R3", "R4", "R5"];

function riskRank(r: RiskClearanceLevel): number {
  return RISK_ORDER.indexOf(r);
}

/**
 * AgentCapabilityGraph — registry and optimizer.
 * Agents are registered with their capability vectors and empirical metrics.
 * Task assignment is solved as a multi-dimensional fitness optimization.
 */
export class AgentCapabilityGraph {
  private agents: Map<string, AgentCapabilityProfile> = new Map();

  register(profile: AgentCapabilityProfile): void {
    this.agents.set(profile.agentId, {
      ...profile,
      lastUpdatedAt: new Date().toISOString(),
    });
  }

  /**
   * Updates an agent's historical metrics after task completion.
   * This is what makes reputation empirical — not self-reported.
   */
  updateMetrics(agentId: string, outcome: Partial<AgentHistoricalMetrics>): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    agent.metrics = { ...agent.metrics, ...outcome };
    agent.lastUpdatedAt = new Date().toISOString();
  }

  /**
   * Finds the best available agent for a task using multi-dimensional fitness scoring.
   *
   * Fitness = 0.40 × capabilityMatch + 0.30 × reliability + 0.20 × costEfficiency + 0.10 × latencyScore
   *
   * Any agent whose riskClearance < task.riskClass is categorically excluded.
   */
  assign(request: TaskAssignmentRequest): AssignmentResult | null {
    const candidates = Array.from(this.agents.values()).filter(
      (a) =>
        a.isAvailable &&
        riskRank(a.riskClearanceLevel) >= riskRank(request.riskClass)
    );

    if (candidates.length === 0) return null;

    const scored = candidates.map((agent) => {
      // Capability match: geometric mean over required dimensions
      const capDomains = Object.keys(request.requiredCapabilities);
      const capScores = capDomains.map((d) => {
        const agentScore = agent.capabilities[d] ?? 0;
        const required = request.requiredCapabilities[d];
        return Math.min(1.0, agentScore / Math.max(required, 0.01));
      });
      const capabilityMatch = capDomains.length > 0
        ? Math.pow(capScores.reduce((a, b) => a * b, 1), 1 / capDomains.length)
        : 1.0;

      const reliability = agent.metrics.successRate * (1 - agent.metrics.defectRate / 100);
      const maxCost = request.maxCostPerKToken ?? 0.01;
      const costScore = Math.max(0, 1 - agent.metrics.averageCostPerKToken / maxCost);
      const latencyScore = request.preferLowLatency
        ? Math.max(0, 1 - agent.metrics.averageLatencyMs / 5000)
        : 0.5;

      const fit =
        0.40 * capabilityMatch +
        0.30 * reliability +
        0.20 * costScore +
        0.10 * latencyScore;

      return { agent, fit, capabilityMatch, reliability, costScore };
    });

    scored.sort((a, b) => b.fit - a.fit);
    const best = scored[0];

    return {
      taskId: request.taskId,
      assignedAgentId: best.agent.agentId,
      fitScore: Number(best.fit.toFixed(4)),
      reliabilityScore: Number(best.reliability.toFixed(4)),
      costScore: Number(best.costScore.toFixed(4)),
      capabilityMatchScore: Number(best.capabilityMatch.toFixed(4)),
      riskClearanceAdequate: riskRank(best.agent.riskClearanceLevel) >= riskRank(request.riskClass),
      explanation:
        `Agent '${best.agent.displayName}' selected with composite fit ${(best.fit * 100).toFixed(1)}%. ` +
        `Capability match: ${(best.capabilityMatch * 100).toFixed(1)}%, ` +
        `Reliability: ${(best.reliability * 100).toFixed(1)}%, ` +
        `Risk clearance: ${best.agent.riskClearanceLevel} (required: ${request.riskClass}).`,
    };
  }

  getProfile(agentId: string): AgentCapabilityProfile | undefined {
    return this.agents.get(agentId);
  }

  listAll(): AgentCapabilityProfile[] {
    return Array.from(this.agents.values());
  }
}

/**
 * Factory: seed the graph with Hell-x's canonical agent profiles.
 * Metrics start at informed estimates — they will be updated empirically
 * after each real task execution cycle.
 */
export function createDefaultCapabilityGraph(): AgentCapabilityGraph {
  const graph = new AgentCapabilityGraph();

  graph.register({
    agentId: "agent-backend-lead",
    displayName: "Backend Specialist",
    primaryRole: "BACKEND_SPECIALIST",
    capabilities: {
      typescript: 0.97, postgresql: 0.95, "payments-api": 0.93,
      security: 0.78, "api-design": 0.92, redis: 0.85,
    },
    metrics: {
      tasksAttempted: 0, successRate: 0.92, defectRate: 2.1,
      mutationKillRate: 0.82, firstPassVerificationRate: 0.88,
      rollbacksTriggered: 0, averageCostPerKToken: 0.004,
      averageLatencyMs: 1200, humanInterventionRate: 0.05,
    },
    riskClearanceLevel: "R4",
    modelIdentifier: "gpt-4o",
    isAvailable: true,
    lastUpdatedAt: new Date().toISOString(),
  });

  graph.register({
    agentId: "agent-frontend-lead",
    displayName: "Frontend Specialist",
    primaryRole: "FRONTEND_SPECIALIST",
    capabilities: {
      react: 0.97, typescript: 0.95, accessibility: 0.88,
      "css-design-systems": 0.91, security: 0.65, "api-integration": 0.83,
    },
    metrics: {
      tasksAttempted: 0, successRate: 0.90, defectRate: 2.8,
      mutationKillRate: 0.78, firstPassVerificationRate: 0.85,
      rollbacksTriggered: 0, averageCostPerKToken: 0.003,
      averageLatencyMs: 900, humanInterventionRate: 0.06,
    },
    riskClearanceLevel: "R2",
    modelIdentifier: "gpt-4o",
    isAvailable: true,
    lastUpdatedAt: new Date().toISOString(),
  });

  graph.register({
    agentId: "agent-security-lead",
    displayName: "Security Specialist",
    primaryRole: "SECURITY_SPECIALIST",
    capabilities: {
      security: 0.98, "threat-modeling": 0.96, "penetration-testing": 0.91,
      typescript: 0.80, postgresql: 0.75, "secret-management": 0.95,
    },
    metrics: {
      tasksAttempted: 0, successRate: 0.96, defectRate: 0.5,
      mutationKillRate: 0.91, firstPassVerificationRate: 0.94,
      rollbacksTriggered: 0, averageCostPerKToken: 0.006,
      averageLatencyMs: 2100, humanInterventionRate: 0.02,
    },
    riskClearanceLevel: "R5",
    modelIdentifier: "claude-3-5-sonnet",
    isAvailable: true,
    lastUpdatedAt: new Date().toISOString(),
  });

  graph.register({
    agentId: "agent-qa-lead",
    displayName: "QA Engineer",
    primaryRole: "QA_ENGINEER",
    capabilities: {
      "test-design": 0.96, "mutation-testing": 0.90, typescript: 0.85,
      "browser-automation": 0.88, "performance-testing": 0.82, security: 0.70,
    },
    metrics: {
      tasksAttempted: 0, successRate: 0.94, defectRate: 0.8,
      mutationKillRate: 0.93, firstPassVerificationRate: 0.91,
      rollbacksTriggered: 0, averageCostPerKToken: 0.003,
      averageLatencyMs: 800, humanInterventionRate: 0.03,
    },
    riskClearanceLevel: "R3",
    modelIdentifier: "gpt-4o",
    isAvailable: true,
    lastUpdatedAt: new Date().toISOString(),
  });

  return graph;
}
