/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Predictive Blast Radius & Cascading Failure Simulator (Section 28 & 29)
 */

import { BlastRadiusSimulation, CascadingFailureScenario } from "./types.js";
import { DigitalTwinEngine } from "../twin/digital-twin-engine.js";

export class BlastRadiusSimulator {
  private twin: DigitalTwinEngine;

  constructor(twin: DigitalTwinEngine) {
    this.twin = twin;
  }

  public simulateBlastRadius(change: {
    targetNodeId: string;
    changeType: "SCHEMA_MIGRATION" | "API_MODIFICATION" | "DEPENDENCY_UPGRADE" | "CONFIGURATION_CHANGE";
    touchesPrimaryDb: boolean;
    isBreakingChange: boolean;
  }): BlastRadiusSimulation {
    const twinState = this.twin.getState();
    const directImpactNodes: string[] = [change.targetNodeId];
    const transitiveImpactNodes: string[] = [];

    // Compute direct and transitive dependencies
    for (const node of twinState.nodes) {
      if (node.dependencies.includes(change.targetNodeId)) {
        if (!directImpactNodes.includes(node.id)) {
          directImpactNodes.push(node.id);
        }
      }
    }

    for (const node of twinState.nodes) {
      for (const direct of directImpactNodes) {
        if (node.dependencies.includes(direct) && !directImpactNodes.includes(node.id) && !transitiveImpactNodes.includes(node.id)) {
          transitiveImpactNodes.push(node.id);
        }
      }
    }

    const totalImpactCount = directImpactNodes.length + transitiveImpactNodes.length;
    let cascadingFailureProbability = 0.05;
    let riskTier: BlastRadiusSimulation["riskTier"] = "LOW";

    if (change.touchesPrimaryDb && change.isBreakingChange) {
      cascadingFailureProbability = 0.85;
      riskTier = "CRITICAL";
    } else if (change.isBreakingChange || totalImpactCount >= 3) {
      cascadingFailureProbability = 0.45;
      riskTier = "HIGH";
    } else if (totalImpactCount >= 2) {
      cascadingFailureProbability = 0.20;
      riskTier = "MEDIUM";
    }

    const mitigations: string[] = [];
    if (change.touchesPrimaryDb) {
      mitigations.push("Execute database migration in dual-write phased mode with backward compatible views.");
    }
    if (change.isBreakingChange) {
      mitigations.push("Deploy API sidecar adapter maintaining v1 backwards compatibility.");
    }
    if (riskTier === "CRITICAL" || riskTier === "HIGH") {
      mitigations.push("Enforce Multi-Sig Human Lead Approval on RELEASE_GATE prior to Canary promotion.");
    }

    return {
      id: `blast-sim-${Date.now()}`,
      sourceTarget: change.targetNodeId,
      directImpactNodes,
      transitiveImpactNodes,
      cascadingFailureProbability,
      riskTier,
      databaseLockContentionRisk: change.touchesPrimaryDb && change.changeType === "SCHEMA_MIGRATION",
      breakingContractCount: change.isBreakingChange ? 1 : 0,
      mitigationSteps: mitigations,
      createdAt: new Date().toISOString(),
    };
  }

  public simulateCascadingFailure(failedNodeId: string): CascadingFailureScenario {
    const twinState = this.twin.getState();
    const propagationPath: string[] = [failedNodeId];

    for (const node of twinState.nodes) {
      if (node.dependencies.includes(failedNodeId) && !propagationPath.includes(node.id)) {
        propagationPath.push(node.id);
      }
    }

    return {
      failureNodeId: failedNodeId,
      triggerEvent: `Simulated catastrophic crash on ${failedNodeId}`,
      propagationPath,
      estimatedTTRSeconds: 15,
      circuitBreakerTripped: true,
    };
  }
}
