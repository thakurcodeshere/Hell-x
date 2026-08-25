/**
 * Hell-x Tests: Agent Capability Graph (Step 09)
 */
import { describe, it, expect } from "vitest";
import {
  AgentCapabilityGraph,
  createDefaultCapabilityGraph,
} from "../src/workforce/capability-graph.js";

describe("AgentCapabilityGraph — Dynamic Assignment Optimization (Step 09)", () => {
  it("assigns the most capable agent for a given domain", () => {
    const graph = createDefaultCapabilityGraph();
    const result = graph.assign({
      taskId: "task-payment-api-001",
      requiredCapabilities: { "payments-api": 0.85, typescript: 0.90 },
      riskClass: "R2",
    });
    expect(result).not.toBeNull();
    expect(result!.assignedAgentId).toBe("agent-backend-lead");
    expect(result!.riskClearanceAdequate).toBe(true);
    expect(result!.fitScore).toBeGreaterThan(0.5);
  });

  it("assigns security specialist for security-heavy tasks", () => {
    const graph = createDefaultCapabilityGraph();
    const result = graph.assign({
      taskId: "task-threat-model-001",
      requiredCapabilities: { "threat-modeling": 0.85, security: 0.90 },
      riskClass: "R3",
    });
    expect(result).not.toBeNull();
    expect(result!.assignedAgentId).toBe("agent-security-lead");
  });

  it("categorically excludes agents without sufficient risk clearance", () => {
    const graph = createDefaultCapabilityGraph();
    // R5 task — only security specialist (R5) should be eligible
    const result = graph.assign({
      taskId: "task-critical-secret",
      requiredCapabilities: { security: 0.5 },
      riskClass: "R5",
    });
    // Only security specialist has R5 clearance
    expect(result).not.toBeNull();
    expect(result!.assignedAgentId).toBe("agent-security-lead");
  });

  it("returns null when no agent meets risk clearance", () => {
    const graph = new AgentCapabilityGraph();
    graph.register({
      agentId: "agent-low",
      displayName: "Low Clearance",
      primaryRole: "REVIEWER",
      capabilities: { security: 0.5 },
      metrics: {
        tasksAttempted: 0, successRate: 0.9, defectRate: 1,
        mutationKillRate: 0.8, firstPassVerificationRate: 0.85,
        rollbacksTriggered: 0, averageCostPerKToken: 0.002,
        averageLatencyMs: 500, humanInterventionRate: 0.05,
      },
      riskClearanceLevel: "R0",
      modelIdentifier: "gpt-4o-mini",
      isAvailable: true,
      lastUpdatedAt: new Date().toISOString(),
    });
    const result = graph.assign({
      taskId: "task-high-risk",
      requiredCapabilities: { security: 0.5 },
      riskClass: "R4",
    });
    expect(result).toBeNull();
  });

  it("fit score includes reliability and cost dimensions", () => {
    const graph = createDefaultCapabilityGraph();
    const result = graph.assign({
      taskId: "task-ts-001",
      requiredCapabilities: { typescript: 0.80 },
      riskClass: "R1",
      maxCostPerKToken: 0.01,
    });
    expect(result).not.toBeNull();
    expect(result!.reliabilityScore).toBeGreaterThan(0);
    expect(result!.costScore).toBeGreaterThanOrEqual(0);
    expect(result!.explanation).toContain("selected with composite fit");
  });

  it("updates metrics empirically after task completion", () => {
    const graph = createDefaultCapabilityGraph();
    graph.updateMetrics("agent-backend-lead", { successRate: 0.99, defectRate: 0.5 });
    const profile = graph.getProfile("agent-backend-lead");
    expect(profile?.metrics.successRate).toBe(0.99);
    expect(profile?.metrics.defectRate).toBe(0.5);
  });
});
