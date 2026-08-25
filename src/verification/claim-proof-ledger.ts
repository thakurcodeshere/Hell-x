/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Claim vs. Proof Ledger Engine (Section 19)
 */

import { ClaimStatement, ClaimProofPair, DiscrepancyReport } from "./types.js";
import { EvidenceArtifact } from "../core/artifacts.js";

export class ClaimProofLedger {
  private claimPairs: ClaimProofPair[] = [];

  public registerClaim(claim: ClaimStatement): void {
    this.claimPairs.push({
      claim,
      isProven: false,
    });
  }

  /**
   * Attaches independent evidence to reconcile and prove a claim
   */
  public attachProof(claimId: string, evidence: EvidenceArtifact): ClaimProofPair {
    const pair = this.claimPairs.find((p) => p.claim.id === claimId);
    if (!pair) {
      throw new Error(`Claim '${claimId}' not found in ledger.`);
    }

    const matchesRequirement = evidence.targetRequirementCode === pair.claim.targetRequirementCode;
    const passed = evidence.verifiedPassed;

    pair.attachedEvidence = evidence;
    pair.isProven = matchesRequirement && passed;

    if (!matchesRequirement) {
      pair.discrepancyNotes = `Evidence requirement '${evidence.targetRequirementCode}' does not match claim requirement '${pair.claim.targetRequirementCode}'.`;
    } else if (!passed) {
      pair.discrepancyNotes = `Attached evidence failed verification check.`;
    } else {
      pair.discrepancyNotes = undefined;
    }

    return pair;
  }

  /**
   * Generates a comprehensive Discrepancy Report
   */
  public auditClaims(): DiscrepancyReport {
    const totalClaims = this.claimPairs.length;
    const provenClaims = this.claimPairs.filter((p) => p.isProven).length;
    const unprovenClaims = totalClaims - provenClaims;
    const discrepancies = this.claimPairs.filter((p) => !p.isProven);

    return {
      totalClaims,
      provenClaims,
      unprovenClaims,
      discrepancies,
      allClaimsProven: unprovenClaims === 0,
    };
  }
}
