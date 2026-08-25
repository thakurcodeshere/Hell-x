/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Architectural Decision Record (ADR) & Multi-Option Tradeoff Engine
 */

import { ADRArtifact, RequirementArtifact } from "../core/artifacts.js";
import { ArtifactStore } from "../storage/artifact-store.js";
import { EventBus } from "../storage/event-bus.js";

export class ADREngine {
  constructor(private artifactStore?: ArtifactStore, private eventBus?: EventBus) {}

  /**
   * Automatically derives and records an ADR for a given architectural challenge
   */
  public async proposeADR(params: {
    code: string; // e.g. ADR-001
    title: string;
    contextAndProblem: string;
    decision: string;
    alternativesConsidered: { name: string; pros: string[]; cons: string[] }[];
    consequencesPositive: string[];
    consequencesNegative: string[];
    assumptions: string[];
    affectedRequirements: string[];
    securityConsiderations: string;
    authorId?: string;
  }): Promise<ADRArtifact> {
    const adr: ADRArtifact = {
      id: `art-${params.code.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      type: "ADR",
      code: params.code,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: params.authorId || "agent-system-architect-01",
      authorRole: "SYSTEM_ARCHITECT",
      title: params.title,
      status: "ACCEPTED",
      contextAndProblem: params.contextAndProblem,
      decision: params.decision,
      alternativesConsidered: params.alternativesConsidered,
      consequencesPositive: params.consequencesPositive,
      consequencesNegative: params.consequencesNegative,
      assumptions: params.assumptions,
      affectedRequirements: params.affectedRequirements,
      securityConsiderations: params.securityConsiderations,
      dependencies: [],
      tags: ["architecture", "adr"],
      immutable: true,
    };

    if (this.artifactStore) {
      await this.artifactStore.put(adr);
    }

    if (this.eventBus) {
      await this.eventBus.publish({
        id: `evt-${adr.code.toLowerCase()}-${Date.now()}`,
        type: "ADR_ACCEPTED",
        actorId: adr.authorId,
        actorRole: adr.authorRole,
        payload: {
          code: adr.code,
          title: adr.title,
          decision: adr.decision,
          affectedRequirements: adr.affectedRequirements,
        },
      });
    }

    return adr;
  }

  /**
   * Synthesizes standard baseline ADRs from requirements
   */
  public generateBaselineADRs(requirements: RequirementArtifact[]): ADRArtifact[] {
    const adrs: ADRArtifact[] = [];
    const reqCodes = requirements.map((r) => r.code);

    // 1. Data Store Strategy ADR
    adrs.push({
      id: `art-adr-001-${Date.now().toString().slice(-4)}`,
      type: "ADR",
      code: "ADR-001",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "agent-system-architect-01",
      authorRole: "SYSTEM_ARCHITECT",
      title: "Relational PostgreSQL Data Store with Append-Only Audit Ledger",
      status: "ACCEPTED",
      contextAndProblem: "Need ACID transactional integrity for payments alongside immutable auditability.",
      decision: "Adopt PostgreSQL with row-level security (RLS) and append-only audit event logging.",
      alternativesConsidered: [
        { name: "Pure Document Store (MongoDB)", pros: ["Flexible schema"], cons: ["Weak cross-document ACID invariants"] },
        { name: "Hybrid PostgreSQL + EventStoreDB", pros: ["Native event sourcing"], cons: ["Operational overhead for small clusters"] },
      ],
      consequencesPositive: [
        "Strong relational constraints and foreign key guarantees.",
        "ACID guarantees for financial transactions.",
      ],
      consequencesNegative: [
        "Requires database migration tooling (e.g. Flyway or Prisma).",
      ],
      assumptions: ["PostgreSQL 16+ is used with WAL archiving."],
      affectedRequirements: reqCodes,
      securityConsiderations: "Enforce TLS 1.3 in-transit and AES-256 at-rest encryption.",
      dependencies: [],
      tags: ["database", "postgres", "adr"],
      immutable: true,
    });

    // 2. Authentication & Boundary ADR
    adrs.push({
      id: `art-adr-002-${Date.now().toString().slice(-4)}`,
      type: "ADR",
      code: "ADR-002",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "agent-security-architect-01",
      authorRole: "SECURITY_ARCHITECT",
      title: "Stateless JWT Authentication with Redis Token Revocation",
      status: "ACCEPTED",
      contextAndProblem: "Authenticate API requests across stateless compute pods with low latency and immediate revocation on account deletion.",
      decision: "Issue short-lived (15 min) JWT tokens signed with Ed25519, backed by Redis revocation blacklist.",
      alternativesConsidered: [
        { name: "Stateful Server Sessions", pros: ["Instant revocation"], cons: ["Redis lookup on every single API call"] },
        { name: "Pure Unchecked JWTs", pros: ["Zero DB lookups"], cons: ["Cannot instantly revoke token upon account deletion"] },
      ],
      consequencesPositive: [
        "High throughput and low auth verification overhead.",
        "Instant token revocation upon user account deletion or security alert.",
      ],
      consequencesNegative: [
        "Requires Redis cluster deployment.",
      ],
      assumptions: ["Token expiration is strictly capped at 900 seconds."],
      affectedRequirements: reqCodes,
      securityConsiderations: "Secrets stored in KMS and rotated every 90 days.",
      dependencies: [],
      tags: ["security", "auth", "jwt", "adr"],
      immutable: true,
    });

    return adrs;
  }
}
