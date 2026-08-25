/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Intent Parser & Extraction Engine
 */

import { ExtractedIntentVector, IntentActor, IntentConstraint, IntentOutcome, IntentRisk } from "./types.js";
import { ModelRouter } from "../gateway/router.js";
import { HellxError } from "../core/errors.js";

export class IntentParser {
  constructor(private modelRouter?: ModelRouter) {}

  /**
   * Extracts structured intent vectors from unstructured natural language input
   */
  public async parseIntent(rawInput: string): Promise<ExtractedIntentVector> {
    if (!rawInput || rawInput.trim().length < 5) {
      throw new HellxError("Input intent must be at least 5 characters long.", "INVALID_INTENT_INPUT");
    }

    const trimmed = rawInput.trim();
    const id = `intent-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Domain heuristic detection
    let domain = "GENERAL";
    const lower = trimmed.toLowerCase();
    if (lower.includes("auth") || lower.includes("login") || lower.includes("jwt") || lower.includes("permission")) {
      domain = "AUTH";
    } else if (lower.includes("pay") || lower.includes("billing") || lower.includes("stripe") || lower.includes("invoice")) {
      domain = "PAYMENT";
    } else if (lower.includes("db") || lower.includes("database") || lower.includes("sql") || lower.includes("schema")) {
      domain = "DATA";
    } else if (lower.includes("chat") || lower.includes("message") || lower.includes("notification")) {
      domain = "MESSAGING";
    } else if (lower.includes("ecommerce") || lower.includes("cart") || lower.includes("shop") || lower.includes("order")) {
      domain = "ECOMMERCE";
    }

    // Extraction heuristics
    const actors: IntentActor[] = [
      {
        name: "Primary User",
        description: "Direct operator or end-user of the proposed capability",
        isPrimary: true,
        permissionsNeeded: ["READ", "WRITE"],
      },
      {
        name: "System Administrator",
        description: "Manages system policies and inspects operational logs",
        isPrimary: false,
        permissionsNeeded: ["ADMIN", "AUDIT"],
      },
    ];

    const outcomes: IntentOutcome[] = [
      {
        id: "out-1",
        description: `Successfully fulfill user intent for ${domain}`,
        metric: "Execution Success Rate",
        targetValue: "100%",
      },
    ];

    const constraints: IntentConstraint[] = [];
    if (lower.includes("not") || lower.includes("cannot") || lower.includes("never") || lower.includes("must")) {
      constraints.push({
        id: "const-1",
        category: "SECURITY",
        statement: "Must enforce data privacy and access control boundaries without unauthorized exposure.",
        isHardConstraint: true,
      });
    }

    if (lower.includes("fast") || lower.includes("latency") || lower.includes("scale") || lower.includes("throughput")) {
      constraints.push({
        id: "const-2",
        category: "PERFORMANCE",
        statement: "P99 latency must remain under 200ms under standard production load.",
        isHardConstraint: true,
      });
    }

    const assumptions: string[] = [];
    if (!lower.includes("postgres") && !lower.includes("redis") && !lower.includes("mongo")) {
      assumptions.push("Standard relational database backing (e.g. PostgreSQL or SQLite) is assumed.");
    }
    if (!lower.includes("oauth") && !lower.includes("saml")) {
      assumptions.push("Standard token-based or session authentication is assumed.");
    }

    const risks: IntentRisk[] = [];
    if (lower.includes("delete") || lower.includes("purge") || lower.includes("drop")) {
      risks.push({
        id: "risk-1",
        hazard: "Permanent data destruction or compliance violation",
        severity: "CRITICAL",
        mitigationStrategy: "Implement soft-delete, audit trails, and human confirmation gates.",
      });
    }

    if (lower.includes("pay") || lower.includes("card") || lower.includes("financial")) {
      risks.push({
        id: "risk-2",
        hazard: "Financial loss or PCI-DSS non-compliance",
        severity: "HIGH",
        mitigationStrategy: "Tokenize sensitive payment credentials via certified gateway.",
      });
    }

    // Calculate ambiguity score: lower is clearer, higher is more ambiguous
    let ambiguity = 0.5;
    if (trimmed.length > 100) ambiguity -= 0.15;
    if (trimmed.length > 250) ambiguity -= 0.15;
    if (constraints.length > 0) ambiguity -= 0.1;
    if (risks.length > 0) ambiguity -= 0.05;
    const ambiguityScore = Number(Math.max(0.05, Math.min(0.95, ambiguity)).toFixed(2));

    const vector: ExtractedIntentVector = {
      id,
      rawInput: trimmed,
      summary: `Intent specification for ${domain} system: ${trimmed.slice(0, 120)}...`,
      problemStatement: `Address user requirement in domain ${domain}: "${trimmed}"`,
      targetDomain: domain,
      actors,
      outcomes,
      constraints,
      assumptions,
      externalDependencies: domain === "PAYMENT" ? ["Stripe/Payment Gateway API"] : [],
      risks,
      successCriteria: [
        "All acceptance criteria defined in generated requirements pass independent verification.",
        "Zero unresolved contradictions or security policy violations.",
      ],
      extractedAt: new Date().toISOString(),
      ambiguityScore,
    };

    return vector;
  }
}
