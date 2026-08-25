/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Sandbox Security & Least Privilege Permission Policy
 */

import * as path from "path";
import { AgentRole } from "../core/types.js";
import { SandboxViolationError } from "../core/errors.js";

export interface SandboxPolicyConfig {
  allowedRoot: string;
  readOnlyPaths: string[];
  deniedPaths: string[];
  roleAllowedExtensions: Record<AgentRole, string[]>;
}

export const DEFAULT_SANDBOX_POLICY: SandboxPolicyConfig = {
  allowedRoot: "",
  readOnlyPaths: [".hellx/governance", ".hellx/events.jsonl", ".git"],
  deniedPaths: [".env", ".env.production", "secrets/", "credentials.json"],
  roleAllowedExtensions: {
    PRODUCT_ANALYST: [".md", ".json", ".txt"],
    PRODUCT_MANAGER: [".md", ".json", ".txt"],
    SYSTEM_ARCHITECT: [".md", ".json", ".ts", ".yaml", ".yml"],
    SECURITY_ARCHITECT: [".md", ".json", ".yaml", ".yml"],
    DATA_ARCHITECT: [".sql", ".prisma", ".json", ".md"],
    UX_DESIGNER: [".html", ".css", ".svg", ".json", ".md"],
    FRONTEND_ENGINEER: [".ts", ".tsx", ".js", ".jsx", ".css", ".html", ".json", ".svg"],
    FRONTEND_SPECIALIST: [".ts", ".tsx", ".js", ".jsx", ".css", ".html", ".json", ".svg"],
    BACKEND_ENGINEER: [".ts", ".js", ".json", ".sql", ".py", ".rs", ".go"],
    BACKEND_SPECIALIST: [".ts", ".js", ".json", ".sql", ".py", ".rs", ".go"],
    DATABASE_ENGINEER: [".sql", ".prisma", ".ts", ".json"],
    INFRASTRUCTURE_ENGINEER: [".tf", ".yaml", ".yml", ".dockerfile", "Dockerfile", ".json"],
    QA_ENGINEER: [".ts", ".js", ".test.ts", ".spec.ts", ".json"],
    BROWSER_TESTER: [".ts", ".js", ".json"],
    SECURITY_TESTER: [".ts", ".js", ".json", ".md"],
    PERFORMANCE_ENGINEER: [".ts", ".js", ".json"],
    SRE: [".yaml", ".yml", ".sh", ".ps1", ".json"],
    RELEASE_ENGINEER: [".json", ".md", ".yaml", ".yml"],
    RELEASE_AUTHORITY: [".json", ".md"],
    GOVERNANCE_REVIEWER: [".json", ".md"],
  },
};

export class SandboxPolicyEngine {
  private config: SandboxPolicyConfig;

  constructor(config?: Partial<SandboxPolicyConfig>) {
    this.config = {
      ...DEFAULT_SANDBOX_POLICY,
      ...config,
      roleAllowedExtensions: {
        ...DEFAULT_SANDBOX_POLICY.roleAllowedExtensions,
        ...(config?.roleAllowedExtensions || {}),
      },
    };
  }

  public validateFileAccess(params: {
    targetFilePath: string;
    worktreeRoot: string;
    role: AgentRole;
    accessType: "READ" | "WRITE" | "DELETE";
  }): void {
    const normalizedTarget = path.normalize(params.targetFilePath);
    const normalizedRoot = path.normalize(params.worktreeRoot);

    // 1. Boundary enforcement: must stay within worktree root
    if (!normalizedTarget.startsWith(normalizedRoot)) {
      throw new SandboxViolationError(
        `Path traversal detected. Target path '${normalizedTarget}' is outside worktree boundary '${normalizedRoot}'.`,
        normalizedTarget
      );
    }

    const relPath = path.relative(normalizedRoot, normalizedTarget).replace(/\\/g, "/");

    // 2. Denied paths check
    for (const denied of this.config.deniedPaths) {
      if (relPath === denied || relPath.startsWith(denied.endsWith("/") ? denied : denied + "/")) {
        throw new SandboxViolationError(
          `Access to secret or forbidden path '${relPath}' is strictly denied.`,
          relPath
        );
      }
    }

    // 3. Read-only paths check on WRITE/DELETE
    if (params.accessType !== "READ") {
      for (const ro of this.config.readOnlyPaths) {
        if (relPath === ro || relPath.startsWith(ro.endsWith("/") ? ro : ro + "/")) {
          throw new SandboxViolationError(
            `Cannot modify protected read-only path '${relPath}'.`,
            relPath
          );
        }
      }

      // 4. Role-based extension checks
      const allowedExts = this.config.roleAllowedExtensions[params.role];
      if (allowedExts && allowedExts.length > 0) {
        const ext = path.extname(normalizedTarget).toLowerCase();
        const base = path.basename(normalizedTarget);
        const matchesExt = allowedExts.includes(ext) || allowedExts.includes(base);

        if (!matchesExt && ext !== "") {
          throw new SandboxViolationError(
            `Role '${params.role}' is not authorized to write files of type '${ext}'. Allowed: [${allowedExts.join(", ")}]`,
            relPath
          );
        }
      }
    }
  }
}
