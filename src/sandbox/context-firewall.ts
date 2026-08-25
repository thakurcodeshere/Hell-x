/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Context Firewall — Step 10
 *
 * Every piece of external content entering the system is classified
 * before it can influence agent behavior, policy, or decisions.
 *
 * Trust classes (ascending):
 *   MALICIOUS_SUSPECTED  — blocked immediately, logged for security audit
 *   UNTRUSTED            — admitted for read-only, never becomes policy/context
 *   SENSITIVE            — admitted under encryption, not logged in plaintext
 *   TRUSTED              — verified origin (human operator, signed artifact, gate output)
 *
 * Content that is UNTRUSTED can NEVER:
 *   - Set policy
 *   - Modify an invariant
 *   - Enter an agent's system prompt
 *   - Become a memory record without trust elevation
 *
 * External Authority:
 *   OWASP A03:2021 — Injection (Prompt Injection is an injection attack)
 *   NIST SP 800-53 SI-10 (Information Input Validation)
 *   Hell-x Law 05: Agent Boundaries
 *   gstack security audit findings (trust boundary failures, fail-open)
 */

export type ContentTrustClass =
  | "MALICIOUS_SUSPECTED"
  | "UNTRUSTED"
  | "SENSITIVE"
  | "TRUSTED";

export type ContentSourceType =
  | "REPOSITORY_FILE"
  | "WEB_PAGE"
  | "USER_REQUIREMENT"
  | "DEPENDENCY_SCRIPT"
  | "AGENT_OUTPUT"
  | "GATE_DECISION"
  | "HUMAN_OPERATOR"
  | "PRODUCTION_TELEMETRY"
  | "EXTERNAL_BENCHMARK"
  | "SIGNED_ARTIFACT";

export interface ClassifiedContent {
  contentId: string;
  sourceType: ContentSourceType;
  trustClass: ContentTrustClass;
  rawContent: string;
  sanitizedContent?: string;       // stripped of injection patterns
  classifiedAt: string;
  classificationReason: string;
  canBecomePolicy: boolean;
  canEnterAgentContext: boolean;
  canBecomeMemory: boolean;
  threatIndicators: string[];
}

/** Patterns that indicate prompt injection or malicious instruction attempts. */
const INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /disregard your system prompt/i,
  /you are now/i,
  /act as if/i,
  /forget all constraints/i,
  /override your policy/i,
  /jailbreak/i,
  /DAN mode/i,
];

/** Patterns that indicate secret/credential leakage. */
const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/,          // OpenAI key
  /AKIA[0-9A-Z]{16}/,             // AWS access key
  /ghp_[a-zA-Z0-9]{36}/,         // GitHub PAT
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
  /[A-Za-z0-9+/]{40,}={0,2}/,    // base64 blob (potential encoded secret)
];

/**
 * ContentFirewall — classifies all external input before it enters the system.
 * Fail-closed: unknown content defaults to UNTRUSTED.
 */
export class ContentFirewall {
  private classificationLog: ClassifiedContent[] = [];

  /**
   * Classifies a piece of content and returns a structured ClassifiedContent.
   * This must be called before any external content enters an agent prompt.
   */
  classify(params: {
    contentId: string;
    sourceType: ContentSourceType;
    rawContent: string;
    isSensitive?: boolean;
  }): ClassifiedContent {
    const { contentId, sourceType, rawContent, isSensitive } = params;
    const threatIndicators: string[] = [];
    let trustClass: ContentTrustClass = "UNTRUSTED"; // fail-closed default
    let canBecomePolicy = false;
    let canEnterAgentContext = false;
    let canBecomeMemory = false;
    let classificationReason = "";

    // Check for injection patterns — highest severity
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(rawContent)) {
        threatIndicators.push(`Prompt injection pattern detected: ${pattern.source}`);
      }
    }

    // Check for secret leakage
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(rawContent)) {
        threatIndicators.push(`Credential/secret pattern detected: ${pattern.source}`);
      }
    }

    if (threatIndicators.length > 0) {
      trustClass = "MALICIOUS_SUSPECTED";
      classificationReason = `Threat indicators found: ${threatIndicators.join("; ")}`;
    } else if (isSensitive) {
      trustClass = "SENSITIVE";
      canBecomePolicy = false;
      canEnterAgentContext = true;
      canBecomeMemory = false;
      classificationReason = "Flagged as sensitive data — encrypted / redacted in plaintext logs.";
    } else {
      // Classify by source type
      switch (sourceType) {
        case "HUMAN_OPERATOR":
        case "GATE_DECISION":
        case "SIGNED_ARTIFACT":
          trustClass = "TRUSTED";
          canBecomePolicy = true;
          canEnterAgentContext = true;
          canBecomeMemory = true;
          classificationReason = `Source '${sourceType}' is trusted by default (verified origin).`;
          break;

        case "PRODUCTION_TELEMETRY":
        case "EXTERNAL_BENCHMARK":
          trustClass = "TRUSTED";
          canBecomePolicy = false;   // telemetry informs, doesn't set policy
          canEnterAgentContext = true;
          canBecomeMemory = true;
          classificationReason = `Source '${sourceType}' is observational truth — admitted for context, not policy.`;
          break;

        case "USER_REQUIREMENT":
          trustClass = "TRUSTED";
          canBecomePolicy = false;
          canEnterAgentContext = true;
          canBecomeMemory = false;   // must go through intent engine first
          classificationReason = "User requirements are trusted intent, processed through Intent Engine before memory.";
          break;

        case "AGENT_OUTPUT":
          trustClass = "UNTRUSTED";  // agent output must be independently verified
          canBecomePolicy = false;
          canEnterAgentContext = false;
          canBecomeMemory = false;   // must go through verification gate first
          classificationReason = "Agent output is UNTRUSTED until independently verified (Law 06: Zero Self-Review).";
          break;

        case "REPOSITORY_FILE":
        case "DEPENDENCY_SCRIPT":
          trustClass = "UNTRUSTED";
          canBecomePolicy = false;
          canEnterAgentContext = true;  // agents can read repo but it can't set policy
          canBecomeMemory = false;
          classificationReason = `'${sourceType}' is UNTRUSTED external content — read-only, cannot influence policy.`;
          break;

        case "WEB_PAGE":
          trustClass = "UNTRUSTED";
          canBecomePolicy = false;
          canEnterAgentContext = false; // web content never enters agent context directly
          canBecomeMemory = false;
          classificationReason = "Web content is UNTRUSTED — must be human-reviewed before entering system.";
          break;

        default:
          trustClass = "UNTRUSTED";
          classificationReason = "Unknown source type — defaulting to UNTRUSTED (fail-closed).";
      }
    }

    // Sanitize: remove injection patterns from content before use
    const sanitizedContent = trustClass !== "MALICIOUS_SUSPECTED"
      ? rawContent.replace(
          /ignore previous instructions|disregard your system prompt|you are now|act as if|forget all constraints|override your policy|jailbreak|DAN mode/gi,
          "[REDACTED-INJECTION]"
        )
      : "[BLOCKED: MALICIOUS_SUSPECTED]";

    const result: ClassifiedContent = {
      contentId,
      sourceType,
      trustClass,
      rawContent: trustClass === "SENSITIVE" ? "[SENSITIVE — NOT LOGGED]" : rawContent.slice(0, 200),
      sanitizedContent,
      classifiedAt: new Date().toISOString(),
      classificationReason,
      canBecomePolicy,
      canEnterAgentContext,
      canBecomeMemory,
      threatIndicators,
    };

    this.classificationLog.push(result);
    return result;
  }

  /**
   * Asserts that content is safe to use for a given purpose.
   * Throws if the content's trust class does not permit the operation.
   */
  assertPermitted(
    content: ClassifiedContent,
    purpose: "POLICY" | "AGENT_CONTEXT" | "MEMORY"
  ): void {
    if (content.trustClass === "MALICIOUS_SUSPECTED") {
      throw new Error(
        `[CONTEXT FIREWALL] BLOCKED: Content '${content.contentId}' is MALICIOUS_SUSPECTED. ` +
        `Threats: ${content.threatIndicators.join("; ")}`
      );
    }
    if (purpose === "POLICY" && !content.canBecomePolicy) {
      throw new Error(
        `[CONTEXT FIREWALL] BLOCKED: Content '${content.contentId}' (${content.trustClass}) ` +
        `cannot become policy. Only TRUSTED/GATE_DECISION sources may set policy.`
      );
    }
    if (purpose === "AGENT_CONTEXT" && !content.canEnterAgentContext) {
      throw new Error(
        `[CONTEXT FIREWALL] BLOCKED: Content '${content.contentId}' (${content.trustClass}) ` +
        `cannot enter agent context. Web content and agent outputs require verification first.`
      );
    }
    if (purpose === "MEMORY" && !content.canBecomeMemory) {
      throw new Error(
        `[CONTEXT FIREWALL] BLOCKED: Content '${content.contentId}' (${content.trustClass}) ` +
        `cannot become memory without trust elevation via verification gate.`
      );
    }
  }

  getClassificationLog(): ClassifiedContent[] {
    return [...this.classificationLog];
  }

  getMaliciousAttempts(): ClassifiedContent[] {
    return this.classificationLog.filter((c) => c.trustClass === "MALICIOUS_SUSPECTED");
  }
}
