/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * 10-Dimensional Requirement Completeness Engine
 */

import { RequirementArtifact } from "../core/artifacts.js";
import { CompletenessRadar10D, CompletenessReport } from "./types.js";

export class CompletenessEngine {
  /**
   * Evaluates the 10 dimensions of completeness for a requirement
   */
  public evaluateCompleteness(req: RequirementArtifact): CompletenessReport {
    // 1. Functional: workflow length, expected result, preconditions
    let functional = 0.5;
    if (req.workflow.length >= 3) functional += 0.3;
    if (req.preconditions.length > 0) functional += 0.1;
    if (req.expectedResult.length > 10) functional += 0.1;

    // 2. UX: actor clarity, trigger, error states
    let ux = 0.5;
    if (req.actor.length > 3) ux += 0.25;
    if (req.trigger.length > 5) ux += 0.25;

    // 3. Data: constraints, inputs/outputs
    let data = 0.7;
    if (req.acceptanceCriteria.some((ac) => ac.toLowerCase().includes("data") || ac.toLowerCase().includes("token") || ac.toLowerCase().includes("code") || ac.toLowerCase().includes("table") || ac.toLowerCase().includes("schema") || ac.toLowerCase().includes("payload"))) {
      data += 0.25;
    }

    // 4. Security: riskLevel considerations, auth constraints
    let security = 0.7;
    if (req.riskLevel === "HIGH" || req.riskLevel === "CRITICAL") security += 0.15;
    if (req.constraints.some((c) => c.toLowerCase().includes("secret") || c.toLowerCase().includes("token") || c.toLowerCase().includes("auth") || c.toLowerCase().includes("encrypt") || c.toLowerCase().includes("pkce"))) {
      security += 0.15;
    }

    // 5. Operational: verification method, deployment
    let operational = 0.7;
    if (req.verificationMethod.length > 5) operational += 0.25;

    // 6. Integration: external systems, dependencies
    let integration = 0.75;
    if (req.dependencies.length > 0) integration += 0.2;

    // 7. Error Handling: edge cases coverage
    let errorHandling = 0.5;
    if (req.edgeCases.length >= 1) errorHandling += 0.25;
    if (req.edgeCases.length >= 2) errorHandling += 0.2;
    if (req.acceptanceCriteria.some((ac) => ac.toLowerCase().includes("fail") || ac.toLowerCase().includes("error") || ac.toLowerCase().includes("invalid") || ac.toLowerCase().includes("revoke"))) {
      errorHandling += 0.05;
    }

    // 8. Scalability: constraints on performance
    let scalability = 0.7;
    if (req.constraints.some((c) => c.toLowerCase().includes("latency") || c.toLowerCase().includes("rate") || c.toLowerCase().includes("scale") || c.toLowerCase().includes("load") || c.toLowerCase().includes("expire") || c.toLowerCase().includes("second"))) {
      scalability += 0.25;
    }

    // 9. Compliance: auditability, constraints
    let compliance = 0.7;
    if (req.constraints.some((c) => c.toLowerCase().includes("pci") || c.toLowerCase().includes("gdpr") || c.toLowerCase().includes("audit") || c.toLowerCase().includes("log") || c.toLowerCase().includes("rfc") || c.toLowerCase().includes("standard"))) {
      compliance += 0.25;
    }

    // 10. Observability: verification & logging criteria
    let observability = 0.7;
    if (req.acceptanceCriteria.some((ac) => ac.toLowerCase().includes("log") || ac.toLowerCase().includes("metric") || ac.toLowerCase().includes("trace") || ac.toLowerCase().includes("telemetry") || ac.toLowerCase().includes("verify"))) {
      observability += 0.25;
    }

    const radar: CompletenessRadar10D = {
      functional: Number(Math.min(1.0, functional).toFixed(2)),
      ux: Number(Math.min(1.0, ux).toFixed(2)),
      data: Number(Math.min(1.0, data).toFixed(2)),
      security: Number(Math.min(1.0, security).toFixed(2)),
      operational: Number(Math.min(1.0, operational).toFixed(2)),
      integration: Number(Math.min(1.0, integration).toFixed(2)),
      errorHandling: Number(Math.min(1.0, errorHandling).toFixed(2)),
      scalability: Number(Math.min(1.0, scalability).toFixed(2)),
      compliance: Number(Math.min(1.0, compliance).toFixed(2)),
      observability: Number(Math.min(1.0, observability).toFixed(2)),
    };

    const scores = Object.values(radar);
    const overallScore = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(3));

    const missingDimensions: string[] = [];
    const recommendations: string[] = [];

    for (const [dim, val] of Object.entries(radar)) {
      if (val < 0.7) {
        missingDimensions.push(dim);
        recommendations.push(`Improve ${dim} completeness (current: ${(val * 100).toFixed(0)}%, target: >=70%)`);
      }
    }

    const isReadyForArchitecture = overallScore >= 0.75 && missingDimensions.length <= 2;

    return {
      requirementCode: req.code,
      overallScore,
      radar,
      isReadyForArchitecture,
      missingDimensions,
      recommendations,
    };
  }
}
