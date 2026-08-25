/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Prediction Accuracy Memory — Step 12
 *
 * After every mission, Hell-x records its predictions vs. actual outcomes.
 * Over time, the system learns how wrong it tends to be per domain.
 * This is what turns the Digital Twin from a visualization into a learning system.
 *
 * Prediction types tracked:
 *   - P95 latency predictions vs. actual telemetry
 *   - Cost estimates vs. actual token spend
 *   - Defect rate estimates vs. escaped defects
 *   - Mission duration estimates vs. actual wall-clock time
 *   - Risk score predictions vs. observed incident rate
 *
 * Engineering Prediction Memory formula (stored in Tier-8 Strategic Memory):
 *   predictionError = |predicted - actual| / max(|actual|, epsilon)
 *   calibrationScore = 1 - averagePredictionError (over last N missions)
 *
 * External Authority:
 *   Hell-x Law 12: Continuous Learning (the system must improve from every mission)
 *   Superforecasting methodology (Tetlock & Gardner, 2015) — calibrated probabilistic forecasting
 *   NIST SP 800-53 PM-7 (Enterprise Architecture)
 */

export type PredictionDomain =
  | "P95_LATENCY_MS"
  | "COST_USD"
  | "DEFECT_RATE_PERCENT"
  | "MISSION_DURATION_MS"
  | "RISK_SCORE";

export interface PredictionRecord {
  id: string;
  missionId: string;
  domain: PredictionDomain;
  predictedValue: number;
  actualValue: number;
  predictionError: number;  // |predicted - actual| / max(|actual|, epsilon)
  context: string[];        // tags describing what this prediction was about
  recordedAt: string;
}

export interface PredictionCalibrationReport {
  domain: PredictionDomain;
  recordCount: number;
  averagePredictionError: number;  // 0.0 = perfect, 1.0 = very poor
  calibrationScore: number;        // 1 - averagePredictionError (higher = better)
  biasDirection: "OVER_ESTIMATE" | "UNDER_ESTIMATE" | "BALANCED";
  averageSignedError: number;      // positive = over-predicted, negative = under-predicted
  p75PredictionError: number;      // 75th percentile error
  recommendation: string;
}

export class PredictionAccuracyEngine {
  private records: PredictionRecord[] = [];

  /**
   * Records a single prediction vs. actual outcome.
   * Call this at mission completion for every metric that was predicted beforehand.
   */
  record(params: {
    missionId: string;
    domain: PredictionDomain;
    predictedValue: number;
    actualValue: number;
    context: string[];
  }): PredictionRecord {
    const epsilon = 1e-9;
    const predictionError =
      Math.abs(params.predictedValue - params.actualValue) /
      Math.max(Math.abs(params.actualValue), epsilon);

    const record: PredictionRecord = {
      id: `pred-${params.missionId}-${params.domain}-${Date.now()}`,
      missionId: params.missionId,
      domain: params.domain,
      predictedValue: params.predictedValue,
      actualValue: params.actualValue,
      predictionError: Number(predictionError.toFixed(4)),
      context: params.context,
      recordedAt: new Date().toISOString(),
    };

    this.records.push(record);
    return record;
  }

  /**
   * Generates a calibration report for a given domain.
   * This tells the system how systematically wrong it is in that domain.
   */
  calibrate(domain: PredictionDomain, lastN?: number): PredictionCalibrationReport {
    let domainRecords = this.records.filter((r) => r.domain === domain);
    if (lastN) {
      domainRecords = domainRecords.slice(-lastN);
    }

    if (domainRecords.length === 0) {
      return {
        domain,
        recordCount: 0,
        averagePredictionError: 0,
        calibrationScore: 1,
        biasDirection: "BALANCED",
        averageSignedError: 0,
        p75PredictionError: 0,
        recommendation: "No prediction history available for this domain yet.",
      };
    }

    const errors = domainRecords.map((r) => r.predictionError);
    const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;

    const signedErrors = domainRecords.map(
      (r) => (r.predictedValue - r.actualValue) / Math.max(Math.abs(r.actualValue), 1e-9)
    );
    const avgSignedError = signedErrors.reduce((a, b) => a + b, 0) / signedErrors.length;

    // P75 error
    const sorted = [...errors].sort((a, b) => a - b);
    const p75Index = Math.floor(sorted.length * 0.75);
    const p75Error = sorted[p75Index] ?? sorted[sorted.length - 1];

    const biasDirection: PredictionCalibrationReport["biasDirection"] =
      avgSignedError > 0.1 ? "OVER_ESTIMATE"
      : avgSignedError < -0.1 ? "UNDER_ESTIMATE"
      : "BALANCED";

    let recommendation: string;
    if (avgError < 0.1) {
      recommendation = `Excellent calibration (error ${(avgError * 100).toFixed(1)}%). No adjustment needed.`;
    } else if (avgError < 0.25) {
      recommendation = `Acceptable calibration (error ${(avgError * 100).toFixed(1)}%). Monitor for drift.`;
    } else if (biasDirection === "OVER_ESTIMATE") {
      recommendation =
        `Poor calibration (error ${(avgError * 100).toFixed(1)}%, systematically OVER-estimating). ` +
        `Apply correction factor of ${(1 - avgSignedError).toFixed(2)}× to future ${domain} predictions.`;
    } else {
      recommendation =
        `Poor calibration (error ${(avgError * 100).toFixed(1)}%, systematically UNDER-estimating). ` +
        `Apply correction factor of ${(1 + Math.abs(avgSignedError)).toFixed(2)}× to future ${domain} predictions.`;
    }

    return {
      domain,
      recordCount: domainRecords.length,
      averagePredictionError: Number(avgError.toFixed(4)),
      calibrationScore: Number(Math.max(0, 1 - avgError).toFixed(4)),
      biasDirection,
      averageSignedError: Number(avgSignedError.toFixed(4)),
      p75PredictionError: Number(p75Error.toFixed(4)),
      recommendation,
    };
  }

  /**
   * Returns calibration reports for all domains.
   * This is the full Engineering Prediction Memory state.
   */
  calibrateAll(lastN?: number): PredictionCalibrationReport[] {
    const domains: PredictionDomain[] = [
      "P95_LATENCY_MS",
      "COST_USD",
      "DEFECT_RATE_PERCENT",
      "MISSION_DURATION_MS",
      "RISK_SCORE",
    ];
    return domains.map((d) => this.calibrate(d, lastN));
  }

  getRecords(domain?: PredictionDomain): PredictionRecord[] {
    return domain ? this.records.filter((r) => r.domain === domain) : [...this.records];
  }
}
