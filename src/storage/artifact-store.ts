/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Content-Addressable Immutable Artifact Store
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { AnyArtifact, BaseArtifact } from "../core/artifacts.js";
import { ArtifactNotFoundError, HellxError } from "../core/errors.js";

export class ArtifactStore {
  private artifacts: Map<string, AnyArtifact> = new Map(); // id -> artifact
  private codeIndex: Map<string, string> = new Map(); // code -> id
  private requirementEvidenceIndex: Map<string, Set<string>> = new Map(); // reqCode -> Set<evidenceId>
  private storageDir?: string;
  private isInitialized: boolean = false;

  constructor(options?: { storageDir?: string }) {
    if (options?.storageDir) {
      this.storageDir = options.storageDir;
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.storageDir) {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
      }

      const files = fs.readdirSync(this.storageDir);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const filePath = path.join(this.storageDir, file);
          const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          this.indexArtifact(raw, false);
        }
      }
    }

    this.isInitialized = true;
  }

  private computeArtifactHash(artifact: AnyArtifact): string {
    const clone = { ...artifact };
    delete (clone as any).sha256Hash;
    const serialized = JSON.stringify(clone, Object.keys(clone).sort());
    return crypto.createHash("sha256").update(serialized).digest("hex");
  }

  private indexArtifact(artifact: AnyArtifact, persist: boolean = true): void {
    const computedHash = this.computeArtifactHash(artifact);
    const enriched = {
      ...artifact,
      sha256Hash: computedHash,
    } as AnyArtifact;

    this.artifacts.set(enriched.id, enriched);

    if ("code" in enriched && typeof (enriched as any).code === "string") {
      this.codeIndex.set((enriched as any).code, enriched.id);
    }

    // Index evidence linked to requirements
    if (enriched.type === "EVIDENCE") {
      const ev = enriched as any;
      if (ev.targetRequirementCode) {
        if (!this.requirementEvidenceIndex.has(ev.targetRequirementCode)) {
          this.requirementEvidenceIndex.set(ev.targetRequirementCode, new Set());
        }
        this.requirementEvidenceIndex.get(ev.targetRequirementCode)!.add(enriched.id);
      }
    }

    if (persist && this.storageDir) {
      const targetFile = path.join(this.storageDir, `${enriched.id}.json`);
      fs.writeFileSync(targetFile, JSON.stringify(enriched, null, 2), "utf-8");
    }
  }

  public async put<T extends AnyArtifact>(artifact: T): Promise<T> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.artifacts.has(artifact.id)) {
      const existing = this.artifacts.get(artifact.id)!;
      if (existing.immutable) {
        throw new HellxError(
          `Cannot overwrite immutable artifact '${artifact.id}' (${artifact.type}). Create a new version or artifact instead.`,
          "IMMUTABLE_ARTIFACT_OVERWRITE"
        );
      }
    }

    this.indexArtifact(artifact, true);
    return this.artifacts.get(artifact.id) as T;
  }

  public get(id: string): AnyArtifact {
    const found = this.artifacts.get(id);
    if (!found) {
      throw new ArtifactNotFoundError(id);
    }
    return found;
  }

  public getByCode(code: string): AnyArtifact | undefined {
    const id = this.codeIndex.get(code);
    if (!id) return undefined;
    return this.artifacts.get(id);
  }

  public getByType<T extends AnyArtifact>(type: string): T[] {
    const results: T[] = [];
    for (const a of this.artifacts.values()) {
      if (a.type === type) {
        results.push(a as T);
      }
    }
    return results;
  }

  public getEvidenceForRequirement(reqCode: string): AnyArtifact[] {
    const evidenceIds = this.requirementEvidenceIndex.get(reqCode);
    if (!evidenceIds) return [];
    return Array.from(evidenceIds).map((id) => this.get(id));
  }

  public getAll(): AnyArtifact[] {
    return Array.from(this.artifacts.values());
  }

  public size(): number {
    return this.artifacts.size;
  }
}
