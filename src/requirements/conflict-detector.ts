/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Contradiction & Cross-Requirement Conflict Detection Engine
 */

import { RequirementArtifact } from "../core/artifacts.js";
import { RequirementConflict } from "./types.js";

export class ConflictDetector {
  private resolvedConflictKeys: Set<string> = new Set();

  public resolveConflict(reqACode: string, reqBCode: string, conflictType: string): void {
    const key = [reqACode, reqBCode, conflictType].sort().join("::");
    this.resolvedConflictKeys.add(key);
  }

  /**
   * Performs exhaustive pairwise conflict analysis across all requirements
   */
  public detectConflicts(requirements: RequirementArtifact[]): RequirementConflict[] {
    const conflicts: RequirementConflict[] = [];

    for (let i = 0; i < requirements.length; i++) {
      for (let j = i + 1; j < requirements.length; j++) {
        const reqA = requirements[i];
        const reqB = requirements[j];

        const textA = `${reqA.title} ${reqA.objective} ${reqA.workflow.join(" ")} ${reqA.constraints.join(" ")} ${reqA.acceptanceCriteria.join(" ")}`.toLowerCase();
        const textB = `${reqB.title} ${reqB.objective} ${reqB.workflow.join(" ")} ${reqB.constraints.join(" ")} ${reqB.acceptanceCriteria.join(" ")}`.toLowerCase();

        // 1. Check Data Retention vs Deletion Conflict
        const aHasDelete = textA.includes("delete") || textA.includes("purge") || textA.includes("erase") || textA.includes("gdpr");
        const bHasRetain = textB.includes("immutable") || textB.includes("retain") || textB.includes("audit") || textB.includes("cannot be deleted") || textB.includes("permanent");

        const bHasDelete = textB.includes("delete") || textB.includes("purge") || textB.includes("erase") || textB.includes("gdpr");
        const aHasRetain = textA.includes("immutable") || textA.includes("retain") || textA.includes("audit") || textA.includes("cannot be deleted") || textA.includes("permanent");

        if ((aHasDelete && bHasRetain) || (bHasDelete && aHasRetain)) {
          const deleteReq = aHasDelete ? reqA : reqB;
          const retainReq = aHasDelete ? reqB : reqA;
          const key = [reqA.code, reqB.code, "DATA_RETENTION_VS_DELETION"].sort().join("::");

          conflicts.push({
            id: `conflict-${Date.now()}-${conflicts.length + 1}`,
            type: "DATA_RETENTION_VS_DELETION",
            severity: "CRITICAL",
            requirementACode: reqA.code,
            requirementBCode: reqB.code,
            statementA: deleteReq.objective,
            statementB: retainReq.objective,
            explanation: `Requirement ${deleteReq.code} specifies data deletion/purging, while requirement ${retainReq.code} requires immutable audit records or regulatory data retention.`,
            suggestedResolution: "Implement soft-delete with cryptographic anonymization/pseudonymization of PII while preserving unlinked financial ledger rows.",
            resolved: this.resolvedConflictKeys.has(key),
          });
        }

        // 2. Check Auth & Access Contradiction
        const aHasPublic = textA.includes("anonymous") || textA.includes("public") || textA.includes("guest") || textA.includes("no auth");
        const bHasStrictAuth = textB.includes("zero trust") || textB.includes("mandatory mfa") || textB.includes("all endpoints require auth");

        const bHasPublic = textB.includes("anonymous") || textB.includes("public") || textB.includes("guest") || textB.includes("no auth");
        const aHasStrictAuth = textA.includes("zero trust") || textA.includes("mandatory mfa") || textA.includes("all endpoints require auth");

        if ((aHasPublic && bHasStrictAuth) || (bHasPublic && aHasStrictAuth)) {
          const key = [reqA.code, reqB.code, "SECURITY_VS_USABILITY"].sort().join("::");
          conflicts.push({
            id: `conflict-${Date.now()}-${conflicts.length + 1}`,
            type: "SECURITY_VS_USABILITY",
            severity: "HIGH",
            requirementACode: reqA.code,
            requirementBCode: reqB.code,
            statementA: reqA.objective,
            statementB: reqB.objective,
            explanation: `Requirement ${reqA.code} and ${reqB.code} have conflicting authentication boundaries (public/guest access vs mandatory strict auth).`,
            suggestedResolution: "Explicitly scope endpoint security boundaries: isolate public guest flows from authenticated member operations.",
            resolved: this.resolvedConflictKeys.has(key),
          });
        }
      }
    }

    return conflicts;
  }
}
