/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * 8-Tier Hierarchical Memory & Learning Substrate (Section 30)
 */

import { MemoryRecord, MemoryCategory, MemoryTrustLevel } from "./types.js";
import { MemoryArtifact } from "../core/artifacts.js";
import { ArtifactStore } from "../storage/artifact-store.js";
import { EventBus } from "../storage/event-bus.js";

export class MemoryEngine {
  private memoryRecords: Map<string, MemoryRecord> = new Map();

  constructor(
    private artifactStore?: ArtifactStore,
    private eventBus?: EventBus
  ) {}

  /**
   * Stores a new memory record or reinforces an existing matching record
   */
  public async recordMemory(params: {
    category: MemoryCategory;
    summary: string;
    lessonLearned: string;
    preventativeRule?: string;
    applicableContext: string[];
    authorId?: string;
    trustLevel?: MemoryTrustLevel;
    ttlHours?: number;
    trustEvidenceSource?: string;
  }): Promise<MemoryRecord> {
    // Reinforce existing matching lesson
    const existing = Array.from(this.memoryRecords.values()).find(
      (m) => m.category === params.category && m.summary.toLowerCase() === params.summary.toLowerCase()
    );

    if (existing) {
      existing.reinforcementScore = Number((existing.reinforcementScore + 0.5).toFixed(2));
      existing.accessCount += 1;
      existing.lastReinforcedAt = new Date().toISOString();
      // Upgrade trust level if caller provides higher evidence
      if (params.trustLevel && isTrustUpgrade(existing.trustLevel, params.trustLevel)) {
        existing.trustLevel = params.trustLevel;
        if (params.trustEvidenceSource) existing.trustEvidenceSource = params.trustEvidenceSource;
      }
      return existing;
    }

    const codeSuffix = Date.now().toString().slice(-4);
    const code = `MEM-${params.category.replace("_MEMORY", "").slice(0, 4)}-${codeSuffix}`;
    const id = `art-mem-${codeSuffix}-${Math.random().toString(36).slice(2, 6)}`;

    const trustLevel: MemoryTrustLevel = params.trustLevel ?? "OBSERVED";
    const validUntil = params.ttlHours
      ? new Date(Date.now() + params.ttlHours * 3600_000).toISOString()
      : undefined;

    const record: MemoryRecord = {
      id,
      code,
      category: params.category,
      summary: params.summary,
      lessonLearned: params.lessonLearned,
      preventativeRule: params.preventativeRule,
      applicableContext: params.applicableContext,
      reinforcementScore: 1.0,
      accessCount: 1,
      lastReinforcedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      trustLevel,
      verificationStatus: "CLAIMED",
      validUntil,
      trustEvidenceSource: params.trustEvidenceSource,
    };

    this.memoryRecords.set(id, record);

    if (this.artifactStore) {
      const artifact: MemoryArtifact = {
        id: record.id,
        type: "MEMORY",
        code: record.code,
        version: 1,
        createdAt: record.createdAt,
        updatedAt: record.lastReinforcedAt,
        authorId: params.authorId || "system-learning-agent",
        authorRole: "SYSTEM_ARCHITECT",
        category: record.category,
        summary: record.summary,
        lessonLearned: record.lessonLearned,
        preventativeRule: record.preventativeRule,
        applicableContext: record.applicableContext,
        reinforcementScore: record.reinforcementScore,
        dependencies: [],
        tags: ["hierarchical-memory", record.category.toLowerCase(), trustLevel.toLowerCase()],
        immutable: true,
      };
      await this.artifactStore.put(artifact);
    }

    return record;
  }

  /**
   * Retrieves memories matching target context.
   * FAIL-CLOSED: UNVERIFIED and EXPIRED memories are never returned.
   * Stale memories (past validUntil) are automatically marked EXPIRED.
   */
  public queryMemories(contextQuery: string[], category?: MemoryCategory, limit: number = 5): MemoryRecord[] {
    const now = new Date();
    const records = Array.from(this.memoryRecords.values());
    const lowerQuery = contextQuery.map((q) => q.toLowerCase());

    const scored = records
      .filter((r) => !category || r.category === category)
      // Fail-closed: exclude UNVERIFIED
      .filter((r) => r.trustLevel !== "UNVERIFIED")
      // Fail-closed: expire stale memories
      .filter((r) => {
        if (r.validUntil && new Date(r.validUntil) < now) {
          r.verificationStatus = "EXPIRED";
          return false;
        }
        return r.verificationStatus !== "EXPIRED" && r.verificationStatus !== "CONTRADICTED";
      })
      .map((r) => {
        let matchScore = 0;
        for (const q of lowerQuery) {
          if (r.summary.toLowerCase().includes(q)) matchScore += 2;
          if (r.lessonLearned.toLowerCase().includes(q)) matchScore += 1.5;
          if (r.applicableContext.some((c) => c.toLowerCase().includes(q))) matchScore += 2;
        }
        // Weight by both reinforcement score and trust level
        const trustMultiplier =
          r.trustLevel === "AUTHORITATIVE" ? 2.0
          : r.trustLevel === "VERIFIED" ? 1.5
          : r.trustLevel === "OBSERVED" ? 1.0
          : 0.0; // UNVERIFIED filtered above
        const totalScore = matchScore * r.reinforcementScore * trustMultiplier;
        return { record: r, score: totalScore };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => {
        item.record.accessCount += 1;
        return item.record;
      });

    return scored;
  }

  /**
   * Marks a memory record as CONTRADICTED (removes it from future context injections).
   */
  public contradictMemory(id: string, reason: string): void {
    const record = this.memoryRecords.get(id);
    if (record) {
      record.verificationStatus = "CONTRADICTED";
      record.trustEvidenceSource = reason;
    }
  }

  /**
   * Elevates trust level of a memory after independent verification.
   */
  public elevateTrust(id: string, newLevel: MemoryTrustLevel, evidenceSource: string): void {
    const record = this.memoryRecords.get(id);
    if (record && isTrustUpgrade(record.trustLevel, newLevel)) {
      record.trustLevel = newLevel;
      record.verificationStatus = "VERIFIED";
      record.trustEvidenceSource = evidenceSource;
    }
  }

  public getMemoriesByCategory(category: MemoryCategory): MemoryRecord[] {
    return Array.from(this.memoryRecords.values()).filter((r) => r.category === category);
  }

  public getAllMemories(): MemoryRecord[] {
    return Array.from(this.memoryRecords.values());
  }
}

/** Returns true if newLevel is a trust upgrade over current. */
function isTrustUpgrade(current: MemoryTrustLevel, next: MemoryTrustLevel): boolean {
  const ORDER: MemoryTrustLevel[] = ["UNVERIFIED", "OBSERVED", "VERIFIED", "AUTHORITATIVE"];
  return ORDER.indexOf(next) > ORDER.indexOf(current);
}

