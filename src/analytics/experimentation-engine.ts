/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * A/B Experimentation Engine
 * Evaluates candidate feature variants against baselines with statistical significance (p-value < 0.01).
 */

import { ABExperimentConfig, ABExperimentResult } from "./types.js";

export class ExperimentationEngine {
  public evaluateExperiment(
    config: ABExperimentConfig,
    data: {
      baselineImpressions: number;
      baselineConversions: number;
      challengerImpressions: number;
      challengerConversions: number;
    }
  ): ABExperimentResult {
    const baselineConversionRate = Number((data.baselineConversions / Math.max(1, data.baselineImpressions)).toFixed(4));
    const challengerConversionRate = Number((data.challengerConversions / Math.max(1, data.challengerImpressions)).toFixed(4));

    const relativeUpliftPercent = Number(
      (((challengerConversionRate - baselineConversionRate) / Math.max(0.0001, baselineConversionRate)) * 100).toFixed(2)
    );

    // Simplified Z-test approximation for statistical p-value
    const pPooled =
      (data.baselineConversions + data.challengerConversions) /
      (data.baselineImpressions + data.challengerImpressions);
    const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / data.baselineImpressions + 1 / data.challengerImpressions));
    const zScore = Math.abs(challengerConversionRate - baselineConversionRate) / Math.max(0.00001, se);

    // If zScore > 2.58, p-value < 0.01 (99% statistical confidence)
    const pValue = Number(Math.max(0.0001, Math.exp(-0.717 * zScore - 0.416 * zScore * zScore)).toFixed(4));
    const isStatisticallySignificant = pValue < 0.01 && data.challengerImpressions >= config.minimumSampleSize;

    let winningVariant = config.baselineVariant;
    let recommendation: ABExperimentResult["recommendation"] = "CONTINUE_EXPERIMENT";

    if (isStatisticallySignificant) {
      if (relativeUpliftPercent > 0) {
        winningVariant = config.challengerVariant;
        recommendation = "PROMOTE_TO_100";
      } else {
        winningVariant = config.baselineVariant;
        recommendation = "ROLLBACK_CHALLENGER";
      }
    }

    return {
      experimentId: config.experimentId,
      baselineSampleCount: data.baselineImpressions,
      baselineConversionRate,
      challengerSampleCount: data.challengerImpressions,
      challengerConversionRate,
      relativeUpliftPercent,
      pValue,
      isStatisticallySignificant,
      winningVariant,
      recommendation,
    };
  }
}
