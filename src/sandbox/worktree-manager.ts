/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Git Worktree Isolation & Lifecycle Manager
 */

import { execSync, spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { HellxError } from "../core/errors.js";

export interface WorktreeInfo {
  taskId: string;
  branchName: string;
  worktreePath: string;
  createdAt: string;
  baseBranch: string;
}

export class WorktreeManager {
  private repoRoot: string;
  private worktreesBaseDir: string;
  private activeWorktrees: Map<string, WorktreeInfo> = new Map();

  constructor(options: { repoRoot: string; worktreesDir?: string }) {
    this.repoRoot = path.resolve(options.repoRoot);
    this.worktreesBaseDir = options.worktreesDir
      ? path.resolve(options.worktreesDir)
      : path.join(this.repoRoot, ".hellx", "worktrees");
  }

  public initialize(): void {
    if (!fs.existsSync(this.worktreesBaseDir)) {
      fs.mkdirSync(this.worktreesBaseDir, { recursive: true });
    }
  }

  private runGit(args: string[], cwd: string = this.repoRoot): string {
    try {
      const result = execSync(`git ${args.join(" ")}`, {
        cwd,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      return result.trim();
    } catch (err: any) {
      const stderr = err.stderr ? err.stderr.toString().trim() : err.message;
      throw new HellxError(`Git command failed [git ${args.join(" ")}]: ${stderr}`, "GIT_EXEC_ERROR");
    }
  }

  public createWorktree(params: {
    taskId: string;
    branchName?: string;
    baseBranch?: string;
  }): WorktreeInfo {
    this.initialize();

    const taskId = params.taskId;
    const branchName = params.branchName || `hellx/task/${taskId}`;
    const baseBranch = params.baseBranch || "main";
    const targetDir = path.join(this.worktreesBaseDir, taskId);

    if (fs.existsSync(targetDir)) {
      throw new HellxError(`Worktree directory already exists for task '${taskId}' at ${targetDir}`, "WORKTREE_EXISTS");
    }

    // Check if branch already exists, delete or create new
    try {
      this.runGit(["worktree", "add", "-b", branchName, `"${targetDir}"`, baseBranch]);
    } catch (err) {
      // If branch already exists, add without -b
      try {
        this.runGit(["worktree", "add", `"${targetDir}"`, branchName]);
      } catch (innerErr) {
        throw new HellxError(`Failed to create worktree for task ${taskId}: ${(err as Error).message}`, "WORKTREE_CREATION_FAILED");
      }
    }

    const info: WorktreeInfo = {
      taskId,
      branchName,
      worktreePath: targetDir,
      createdAt: new Date().toISOString(),
      baseBranch,
    };

    this.activeWorktrees.set(taskId, info);
    return info;
  }

  public captureDiff(taskId: string): { diffText: string; filesChanged: string[]; stat: string } {
    const info = this.activeWorktrees.get(taskId);
    const wtPath = info ? info.worktreePath : path.join(this.worktreesBaseDir, taskId);

    if (!fs.existsSync(wtPath)) {
      throw new HellxError(`Worktree path for task '${taskId}' does not exist.`, "WORKTREE_NOT_FOUND");
    }

    const diffText = this.runGit(["diff", "HEAD"], wtPath);
    const stat = this.runGit(["diff", "--stat", "HEAD"], wtPath);
    const rawFiles = this.runGit(["diff", "--name-only", "HEAD"], wtPath);
    const filesChanged = rawFiles ? rawFiles.split("\n").filter((f) => f.trim().length > 0) : [];

    return { diffText, filesChanged, stat };
  }

  public commitWork(taskId: string, message: string): string {
    const info = this.activeWorktrees.get(taskId);
    const wtPath = info ? info.worktreePath : path.join(this.worktreesBaseDir, taskId);

    this.runGit(["add", "."], wtPath);
    this.runGit(["commit", "-m", `"${message.replace(/"/g, '\\"')}"`], wtPath);
    const commitHash = this.runGit(["rev-parse", "HEAD"], wtPath);
    return commitHash;
  }

  public removeWorktree(taskId: string, force: boolean = false): void {
    const info = this.activeWorktrees.get(taskId);
    const wtPath = info ? info.worktreePath : path.join(this.worktreesBaseDir, taskId);

    if (fs.existsSync(wtPath)) {
      try {
        const forceFlag = force ? "--force" : "";
        this.runGit(["worktree", "remove", forceFlag, `"${wtPath}"`]);
      } catch (err) {
        // Fallback: prune and delete folder if git worktree remove encounters lock
        this.runGit(["worktree", "prune"]);
        if (fs.existsSync(wtPath)) {
          fs.rmSync(wtPath, { recursive: true, force: true });
        }
      }
    }

    this.activeWorktrees.delete(taskId);
  }

  public listWorktrees(): WorktreeInfo[] {
    return Array.from(this.activeWorktrees.values());
  }
}
