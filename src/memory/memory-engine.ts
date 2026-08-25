/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * 8-Tier Hierarchical Memory & Learning Substrate (Section 30)
 */

import { MemoryRecord, MemoryCategory } from "./types.js";
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
  }): Promise<MemoryRecord> {
    // Check if matching lesson already exists to reinforce
    const existing = Array.from(this.memoryRecords.values()).find(
      (m) => m.category === params.category && m.summary.toLowerCase() === params.summary.toLowerCase()
    );

    if (existing) {
      existing.reinforcementScore = Number((existing.reinforcementScore + 0.5).toFixed(2));
      existing.accessCount += 1;
      existing.lastReinforcedAt = new Date().toISOString();
      return existing;
    }

    const codeSuffix = Date.now().toString().slice(-4);
    const code = `MEM-${params.category.replace("_MEMORY", "").slice(0, 4)}-${codeSuffix}`;
    const id = `art-mem-${codeSuffix}`;

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
        tags: ["hierarchical-memory", record.category.toLowerCase()],
        immutable: true,
      };
      await this.artifactStore.put(artifact);
    }

    return record;
  }

  /**
   * Retrieves memories matching target context weighted by reinforcement score
   */
  public queryMemories(contextQuery: string[], category?: MemoryCategory, limit: number = 5): MemoryRecord[] {
    const records = Array.from(this.memoryRecords.values());
    const lowerQuery = contextQuery.map((q) => q.toLowerCase());

    const scored = records
      .filter((r) => !category || r.category === category)
      .map((r) => {
        let matchScore = 0;
        for (const q of lowerQuery) {
          if (r.summary.toLowerCase().includes(q)) matchScore += 2;
          if (r.lessonLearned.toLowerCase().includes(q)) matchScore += 1.5;
          if (r.applicableContext.some((c) => c.toLowerCase().includes(q))) matchScore += 2;
        }
        // Multiply by reinforcement score
        const totalScore = matchScore * r.reinforcementScore;
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

  public getMemoriesByCategory(category: MemoryCategory): MemoryRecord[] {
    return Array.from(this.memoryRecords.values()).filter((r) => r.category === category);
  }

  public getAllMemories(): MemoryRecord[] {
    return Array.from(this.memoryRecords.values());
  }
}
