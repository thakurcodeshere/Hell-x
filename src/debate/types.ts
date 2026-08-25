/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Adversarial Red-Team / Blue-Team Dialectic Debate Types (Section 30)
 */

export interface DebateTopic {
  id: string;
  title: string;
  category: "ARCHITECTURE_ADR" | "SECURITY_BOUNDARY" | "CONCURRENCY_MODEL" | "RELEASE_SAFETY";
  proposalSummary: string;
}

export interface RedTeamAttack {
  round: number;
  attackVector: string;
  vulnerabilityHypothesis: string;
  exploitScenario: string;
  cweClassification?: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
}

export interface BlueTeamDefense {
  round: number;
  defenseMechanism: string;
  counterProof: string;
  invariantAssertion: string;
  remediedInCode: boolean;
}

export interface DebateRound {
  roundNumber: number;
  attack: RedTeamAttack;
  defense: BlueTeamDefense;
  roundScore: number; // 0 - 100 (Defense effectiveness)
}

export interface DebateVerdict {
  debateId: string;
  topicId: string;
  totalRounds: number;
  overallDefenseScore: number; // 0 - 100 (>= 85 to pass)
  isApprovedForGate: boolean;
  unresolvedVulnerabilities: string[];
  arbiterRulings: string[];
  completedAt: string;
}
