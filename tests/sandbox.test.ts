import { describe, it, expect } from "vitest";
import * as path from "path";
import { SandboxPolicyEngine } from "../src/sandbox/policy.js";
import { SandboxViolationError } from "../src/core/errors.js";

describe("Sandbox & Boundary Security Policy", () => {
  const root = "C:/Projects/Hell-x";
  const policy = new SandboxPolicyEngine({ allowedRoot: root });

  it("blocks directory traversal outside worktree", () => {
    expect(() => {
      policy.validateFileAccess({
        targetFilePath: "C:/Windows/System32/calc.exe",
        worktreeRoot: root,
        role: "BACKEND_ENGINEER",
        accessType: "WRITE",
      });
    }).toThrow(SandboxViolationError);
  });

  it("blocks access to secret and credential paths", () => {
    expect(() => {
      policy.validateFileAccess({
        targetFilePath: path.join(root, ".env.production"),
        worktreeRoot: root,
        role: "BACKEND_ENGINEER",
        accessType: "WRITE",
      });
    }).toThrow(SandboxViolationError);
  });

  it("allows backend engineer to write .ts and .json files within boundary", () => {
    expect(() => {
      policy.validateFileAccess({
        targetFilePath: path.join(root, "src", "service.ts"),
        worktreeRoot: root,
        role: "BACKEND_ENGINEER",
        accessType: "WRITE",
      });
    }).not.toThrow();
  });
});
