/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Cost Intelligence & Economic Engine Types (Section 39 & 44)
 */

export interface MicroCostRecord {
  id: string;
  projectId: string;
  featureId: string;
  requirementCode: string;
  taskId: string;
  agentId: string;
  modelIdentifier: string;
  tokensPrompt: number;
  tokensCompletion: number;
  costUSD: number;
  timestamp: string;
}

export interface EconomicMetrics {
  totalCostUSD: number;
  totalTokensUsed: number;
  costPerFeatureUSD: number;
  costPerVerifiedRequirementUSD: number;
  costPerSuccessfulTaskUSD: number;
  costPerEscapedDefectUSD: number;
  estimatedHumanEquivalentCostUSD: number;
  roiMultiplier: number;
  costEfficiencyScore: number; // 0.0 - 1.0
}
