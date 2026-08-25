/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Core Engineering OS Runtime & Control Plane Substrate
 */

import * as path from "path";
import * as fs from "fs";
import { EventBus } from "../storage/event-bus.js";
import { ArtifactStore } from "../storage/artifact-store.js";
import { WorktreeManager } from "../sandbox/worktree-manager.js";
import { SandboxPolicyEngine } from "../sandbox/policy.js";
import { ModelRouter } from "../gateway/router.js";
import { PolicyEngine } from "../governance/policy-engine.js";
import { GateEvaluator } from "../governance/gate-evaluator.js";
import { ProjectMetadata, WorkspaceConfig } from "./types.js";

export class EngineeringOS {
  public readonly eventBus: EventBus;
  public readonly artifactStore: ArtifactStore;
  public readonly worktreeManager: WorktreeManager;
  public readonly sandboxPolicy: SandboxPolicyEngine;
  public readonly modelRouter: ModelRouter;
  public readonly policyEngine: PolicyEngine;
  public readonly gateEvaluator: GateEvaluator;

  private projectRoot: string;
  private config: WorkspaceConfig;
  private metadata?: ProjectMetadata;
  private isInitialized: boolean = false;

  constructor(options?: { projectRoot?: string }) {
    this.projectRoot = options?.projectRoot ? path.resolve(options.projectRoot) : process.cwd();

    this.config = {
      projectRoot: this.projectRoot,
      worktreesDir: path.join(this.projectRoot, ".hellx", "worktrees"),
      storageDir: path.join(this.projectRoot, ".hellx", "artifacts"),
      artifactsDir: path.join(this.projectRoot, ".hellx", "artifacts"),
      eventsLogPath: path.join(this.projectRoot, ".hellx", "events.jsonl"),
    };

    this.eventBus = new EventBus({ logFilePath: this.config.eventsLogPath });
    this.artifactStore = new ArtifactStore({ storageDir: this.config.artifactsDir });
    this.worktreeManager = new WorktreeManager({
      repoRoot: this.projectRoot,
      worktreesDir: this.config.worktreesDir,
    });
    this.sandboxPolicy = new SandboxPolicyEngine({ allowedRoot: this.projectRoot });
    this.modelRouter = new ModelRouter();
    this.policyEngine = new PolicyEngine();
    this.gateEvaluator = new GateEvaluator(this.artifactStore, this.eventBus, this.policyEngine);
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Ensure .hellx directory structure
    const hellxDir = path.join(this.projectRoot, ".hellx");
    if (!fs.existsSync(hellxDir)) {
      fs.mkdirSync(hellxDir, { recursive: true });
    }

    await this.eventBus.initialize();
    await this.artifactStore.initialize();

    const metadataPath = path.join(hellxDir, "project.json");
    if (fs.existsSync(metadataPath)) {
      this.metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    } else {
      this.metadata = {
        id: `proj-${Date.now()}`,
        name: path.basename(this.projectRoot),
        description: "Hell-x Engineering OS Workspace",
        repositoryPath: this.projectRoot,
        currentState: "INTENT",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        defaultBranch: "main",
        riskPolicyVersion: "1.0.0",
      };
      fs.writeFileSync(metadataPath, JSON.stringify(this.metadata, null, 2), "utf-8");

      await this.eventBus.publish({
        id: `init-${Date.now()}`,
        type: "PROJECT_INITIALIZED",
        actorId: "SYSTEM",
        actorRole: "SRE",
        payload: { project: this.metadata },
      });
    }

    this.isInitialized = true;
  }

  public getMetadata(): ProjectMetadata {
    if (!this.metadata) {
      throw new Error("Engineering OS not initialized.");
    }
    return this.metadata;
  }

  public getConfig(): WorkspaceConfig {
    return this.config;
  }
}
