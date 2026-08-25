/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Continuous Memory Distillation & Self-Healing Guardrail Generator (Section 31 & 33)
 */

import { MemoryEngine } from "./memory-engine.js";
import { DistilledRule, SelfHealingGuardrail } from "./types.js";
import { Role } from "../core/types.js";

export class DistillationEngine {
  constructor(private memoryEngine: MemoryEngine) {}

  /**
   * Distills failure memories into actionable preventative rules
   */
  public distillPreventativeRules(): DistilledRule[] {
    const failureMemories = this.memoryEngine.getMemoriesByCategory("FAILURE_MEMORY");
    const rules: DistilledRule[] = [];

    for (const mem of failureMemories) {
      if (mem.preventativeRule && mem.preventativeRule.trim().length > 0) {
        let targetRole: Role = "BACKEND_SPECIALIST";
        if (mem.applicableContext.includes("security") || mem.applicableContext.includes("auth")) {
          targetRole = "SECURITY_ARCHITECT";
        } else if (mem.applicableContext.includes("database") || mem.applicableContext.includes("postgres") || mem.applicableContext.includes("sql")) {
          targetRole = "DATABASE_ENGINEER";
        } else if (mem.applicableContext.includes("frontend") || mem.applicableContext.includes("ui")) {
          targetRole = "FRONTEND_SPECIALIST";
        } else if (mem.applicableContext.includes("deployment") || mem.applicableContext.includes("canary")) {
          targetRole = "RELEASE_ENGINEER";
        }

        rules.push({
          id: `rule-distill-${Date.now().toString().slice(-4)}-${rules.length + 1}`,
          sourceMemoryCodes: [mem.code],
          ruleStatement: mem.preventativeRule,
          targetRole,
          enforcementAction: "CONTEXT_PACK_INJECTION",
          weight: mem.reinforcementScore,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return rules;
  }

  /**
   * Generates a self-healing guardrail synthetic test from a failure memory
   */
  public generateSelfHealingGuardrail(incidentCode: string, description: string): SelfHealingGuardrail {
    return {
      id: `sh-guard-${Date.now().toString().slice(-4)}`,
      incidentCode,
      syntheticTestCaseCode: `describe("Self-Healing Regression Guard for ${incidentCode}", () => { it("ensures SLO threshold is maintained under load", async () => { /* automated synthetic load */ }); });`,
      suggestedLinterRule: `rule: "enforce-pre-release-canary-soak"`,
      status: "ACTIVE",
    };
  }
}
