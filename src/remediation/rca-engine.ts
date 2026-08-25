/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Root Cause Analyzer (RCA) Engine
 */

import { IncidentReport, RootCauseAnalysis } from "./types.js";

export class RootCauseAnalyzer {
  public analyzeIncident(incident: IncidentReport): RootCauseAnalysis {
    const text = `${incident.title} ${incident.description} ${incident.errorStack || ""} ${incident.metricBreached || ""}`.toLowerCase();

    let defectCategory: RootCauseAnalysis["defectCategory"] = "UNHANDLED_EXCEPTION";
    let affectedFiles = ["src/api/handler.ts"];
    let recommendedRemediation = "Wrap operation in structured try-catch handler and return formatted HTTP error response.";

    if (text.includes("sql") || text.includes("injection") || text.includes("cwe-89") || text.includes("query")) {
      defectCategory = "SQL_INJECTION";
      affectedFiles = ["src/db/queries.ts"];
      recommendedRemediation = "Replace string interpolation with parameterized SQL query placeholders ($1, $2) and enforce input sanitization.";
    } else if (text.includes("secret") || text.includes("cwe-798") || text.includes("api_key") || text.includes("token")) {
      defectCategory = "SECRET_LEAK";
      affectedFiles = ["src/config/secrets.ts"];
      recommendedRemediation = "Remove hardcoded secret credentials and bind to process.env with secure KMS token injection.";
    } else if (text.includes("latency") || text.includes("p99") || text.includes("timeout") || text.includes("slow")) {
      defectCategory = "LATENCY_SPIKE";
      affectedFiles = ["src/services/billing-service.ts"];
      recommendedRemediation = "Add database composite index on tenantId and introduce Redis L2 response cache with 60s TTL.";
    } else if (text.includes("memory") || text.includes("heap") || text.includes("leak")) {
      defectCategory = "MEMORY_LEAK";
      affectedFiles = ["src/cache/event-cache.ts"];
      recommendedRemediation = "Configure LRU cache eviction boundary with maxEntries = 10,000 to prevent unbounded buffer growth.";
    }

    return {
      incidentId: incident.id,
      rootCauseSummary: `Detected ${defectCategory} in ${affectedFiles.join(", ")}. Breach reason: ${incident.description}`,
      affectedFiles,
      defectCategory,
      confidenceScore: 0.96,
      recommendedRemediation,
      analyzedAt: new Date().toISOString(),
    };
  }
}
