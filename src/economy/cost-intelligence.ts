/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Hierarchical Cost Intelligence Engine (Section 39)
 * Tracks economic cost at every level of granularity:
 * Project -> Feature -> Requirement -> Task -> Agent -> Model -> Tool
 */

import { MicroCostRecord, EconomicMetrics } from "./types.js";
import { EventBus } from "../storage/event-bus.js";

export class CostIntelligenceEngine {
  private records: MicroCostRecord[] = [];
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public recordSpend(record: Omit<MicroCostRecord, "id" | "timestamp">): MicroCostRecord {
    const fullRecord: MicroCostRecord = {
      ...record,
      id: `cost-${Date.now()}-${this.records.length + 1}`,
      timestamp: new Date().toISOString(),
    };
    this.records.push(fullRecord);
    return fullRecord;
  }

  public getRecords(): MicroCostRecord[] {
    return [...this.records];
  }

  public calculateMetrics(params: {
    totalFeatures: number;
    verifiedRequirementsCount: number;
    successfulTasksCount: number;
    escapedDefectsCount: number;
  }): EconomicMetrics {
    const totalCostUSD = this.records.reduce((acc, r) => acc + r.costUSD, 0);
    const totalTokensUsed = this.records.reduce((acc, r) => acc + r.tokensPrompt + r.tokensCompletion, 0);

    const safeFeatures = Math.max(1, params.totalFeatures);
    const safeReqs = Math.max(1, params.verifiedRequirementsCount);
    const safeTasks = Math.max(1, params.successfulTasksCount);

    const costPerFeatureUSD = Number((totalCostUSD / safeFeatures).toFixed(4));
    const costPerVerifiedRequirementUSD = Number((totalCostUSD / safeReqs).toFixed(4));
    const costPerSuccessfulTaskUSD = Number((totalCostUSD / safeTasks).toFixed(4));
    const costPerEscapedDefectUSD = params.escapedDefectsCount > 0 ? Number((totalCostUSD / params.escapedDefectsCount).toFixed(4)) : 0;

    // Estimate human equivalent cost ($120/hr senior engineering rate, ~4 hours per verified requirement)
    const estimatedHumanEquivalentCostUSD = params.verifiedRequirementsCount * 4 * 120;
    const roiMultiplier = totalCostUSD > 0 ? Number((estimatedHumanEquivalentCostUSD / totalCostUSD).toFixed(1)) : 1000;
    const costEfficiencyScore = Number(Math.min(1.0, Math.max(0.0, 1.0 - totalCostUSD / (estimatedHumanEquivalentCostUSD || 1))).toFixed(2));

    return {
      totalCostUSD: Number(totalCostUSD.toFixed(4)),
      totalTokensUsed,
      costPerFeatureUSD,
      costPerVerifiedRequirementUSD,
      costPerSuccessfulTaskUSD,
      costPerEscapedDefectUSD,
      estimatedHumanEquivalentCostUSD,
      roiMultiplier,
      costEfficiencyScore,
    };
  }
}
