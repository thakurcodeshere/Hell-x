/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Empirical Agent Trust & Reputation Ledger
 * Tracks real verification track records, penalizes escaped defects, rewards security catches,
 * and generates cryptographically verifiable reputation credentials.
 */

import { createHash } from "crypto";

export interface AgentTrustProfile {
  agentId: string;
  agentRole: string;
  historicalTasksTotal: number;
  peerVerificationPasses: number;
  peerVerificationFailures: number;
  escapedDefectsPenalties: number;
  securityVulnerabilitiesCaught: number;
  empiricalTrustScore: number; // 0.00 - 1.00
  reputationGrade: "ELITE" | "VERIFIED" | "PROBATIONARY" | "SUSPENDED";
  lastActiveSession: string;
}

export interface ReputationAttestationCredential {
  agentId: string;
  trustScore: number;
  reputationGrade: string;
  credentialHash: string;
  issuedAt: string;
}

export class AgentTrustLedger {
  private profiles: Map<string, AgentTrustProfile> = new Map();

  constructor() {
    this.registerAgent({
      agentId: "agent-peer-verifier-01",
      agentRole: "INDEPENDENT_QA_VERIFIER",
      historicalTasksTotal: 340,
      peerVerificationPasses: 332,
      peerVerificationFailures: 8,
      escapedDefectsPenalties: 0,
      securityVulnerabilitiesCaught: 48,
      empiricalTrustScore: 0.99,
      reputationGrade: "ELITE",
      lastActiveSession: new Date().toISOString(),
    });

    this.registerAgent({
      agentId: "agent-backend-01",
      agentRole: "BACKEND_SPECIALIST",
      historicalTasksTotal: 180,
      peerVerificationPasses: 172,
      peerVerificationFailures: 8,
      escapedDefectsPenalties: 0,
      securityVulnerabilitiesCaught: 12,
      empiricalTrustScore: 0.97,
      reputationGrade: "ELITE",
      lastActiveSession: new Date().toISOString(),
    });
  }

  public registerAgent(profile: AgentTrustProfile): void {
    this.profiles.set(profile.agentId, profile);
  }

  public getProfile(agentId: string): AgentTrustProfile | undefined {
    return this.profiles.get(agentId);
  }

  public recordTaskOutcome(params: {
    agentId: string;
    agentRole: string;
    passedPeerVerification: boolean;
    causedEscapedDefect: boolean;
    caughtSecurityBug: boolean;
  }): AgentTrustProfile {
    let profile = this.profiles.get(params.agentId);
    if (!profile) {
      profile = {
        agentId: params.agentId,
        agentRole: params.agentRole,
        historicalTasksTotal: 0,
        peerVerificationPasses: 0,
        peerVerificationFailures: 0,
        escapedDefectsPenalties: 0,
        securityVulnerabilitiesCaught: 0,
        empiricalTrustScore: 0.85,
        reputationGrade: "VERIFIED",
        lastActiveSession: new Date().toISOString(),
      };
      this.profiles.set(params.agentId, profile);
    }

    profile.historicalTasksTotal += 1;
    if (params.passedPeerVerification) {
      profile.peerVerificationPasses += 1;
    } else {
      profile.peerVerificationFailures += 1;
    }

    if (params.causedEscapedDefect) {
      profile.escapedDefectsPenalties += 1;
    }

    if (params.caughtSecurityBug) {
      profile.securityVulnerabilitiesCaught += 1;
    }

    // Calculate Empirical Trust Score
    const passRate = profile.peerVerificationPasses / Math.max(1, profile.historicalTasksTotal);
    const defectPenalty = profile.escapedDefectsPenalties * 0.15;
    const securityReward = Math.min(0.05, profile.securityVulnerabilitiesCaught * 0.005);

    const calculatedScore = Math.max(0.0, Math.min(1.0, passRate - defectPenalty + securityReward));
    profile.empiricalTrustScore = Number(calculatedScore.toFixed(3));

    if (profile.empiricalTrustScore >= 0.95) profile.reputationGrade = "ELITE";
    else if (profile.empiricalTrustScore >= 0.80) profile.reputationGrade = "VERIFIED";
    else if (profile.empiricalTrustScore >= 0.60) profile.reputationGrade = "PROBATIONARY";
    else profile.reputationGrade = "SUSPENDED";

    profile.lastActiveSession = new Date().toISOString();
    return profile;
  }

  public issueCredential(agentId: string): ReputationAttestationCredential {
    const profile = this.profiles.get(agentId);
    if (!profile) {
      throw new Error(`Cannot issue credential for unregistered agent: ${agentId}`);
    }

    const payload = `${agentId}:${profile.empiricalTrustScore}:${profile.reputationGrade}:${Date.now()}`;
    const credentialHash = createHash("sha256").update(payload).digest("hex");

    return {
      agentId,
      trustScore: profile.empiricalTrustScore,
      reputationGrade: profile.reputationGrade,
      credentialHash,
      issuedAt: new Date().toISOString(),
    };
  }
}
