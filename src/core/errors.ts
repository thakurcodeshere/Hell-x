/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Domain Errors Hierarchy
 */

export class HellxError extends Error {
  public readonly code: string;
  public readonly timestamp: string;

  constructor(message: string, code: string = "HELLX_INTERNAL_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

export class GovernanceViolationError extends HellxError {
  constructor(message: string, public readonly ruleId: string) {
    super(`[GOVERNANCE VIOLATION: ${ruleId}] ${message}`, "GOVERNANCE_VIOLATION");
  }
}

export class EvidenceMissingError extends HellxError {
  constructor(public readonly requirementId: string, public readonly missingEvidenceTypes: string[]) {
    super(
      `Requirement ${requirementId} cannot be verified: Missing mandatory evidence [${missingEvidenceTypes.join(", ")}]`,
      "EVIDENCE_MISSING"
    );
  }
}

export class SelfReviewViolationError extends HellxError {
  constructor(public readonly authorId: string, public readonly reviewerId: string, public readonly artifactId: string) {
    super(
      `Primary Principle Violation: Agent ${reviewerId} cannot independently verify artifact ${artifactId} because they are also the author (${authorId}). Claim != Proof.`,
      "SELF_REVIEW_PROHIBITED"
    );
  }
}

export class SandboxViolationError extends HellxError {
  constructor(message: string, public readonly pathAttempted: string) {
    super(`Sandbox Boundary Violation at '${pathAttempted}': ${message}`, "SANDBOX_VIOLATION");
  }
}

export class ArtifactNotFoundError extends HellxError {
  constructor(public readonly artifactId: string) {
    super(`Artifact with ID '${artifactId}' not found in repository.`, "ARTIFACT_NOT_FOUND");
  }
}

export class TaskDependencyBlockedError extends HellxError {
  constructor(public readonly taskId: string, public readonly unresolvedDependencies: string[]) {
    super(
      `Task '${taskId}' cannot execute: Unresolved dependencies [${unresolvedDependencies.join(", ")}]`,
      "TASK_DEPENDENCY_BLOCKED"
    );
  }
}
