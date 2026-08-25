/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 0 End-to-End Simulation Harness
 */

import * as path from "path";
import * as fs from "fs";
import chalk from "chalk";
import { EngineeringOS } from "../core/engine.js";
import { RequirementArtifact, ADRArtifact, TaskNodeArtifact, EvidenceArtifact } from "../core/artifacts.js";
import { SelfReviewViolationError } from "../core/errors.js";

export async function runSimulation(workspaceRoot: string = process.cwd()): Promise<boolean> {
  console.log(chalk.bold.cyan("\n================================================================="));
  console.log(chalk.bold.cyan("   ⚡ HELL-X ENGINEERING OS — PHASE 0 SUBSTRATE SIMULATION ⚡   "));
  console.log(chalk.bold.cyan("=================================================================\n"));

  // 1. Initialize Substrate
  console.log(chalk.yellow("[1/7] Initializing Engineering OS Substrate..."));
  const os = new EngineeringOS({ projectRoot: workspaceRoot });
  await os.initialize();
  console.log(chalk.green(`  ✓ Workspace Substrate initialized at: ${workspaceRoot}`));
  console.log(chalk.green(`  ✓ Cryptographic EventBus ready. Events count: ${os.eventBus.getEvents().length}`));
  console.log(chalk.green(`  ✓ Content-Addressable ArtifactStore ready. Initial size: ${os.artifactStore.size()}`));

  const runSuffix = Date.now().toString().slice(-4);
  const reqCode = `REQ-AUTH-${runSuffix}`;
  const reqId = `art-req-auth-${runSuffix}`;
  const adrCode = `ADR-${runSuffix}`;
  const adrId = `art-adr-${runSuffix}`;
  const taskId = `TASK-AUTH-${runSuffix}`;
  const taskArtId = `art-task-auth-${runSuffix}`;
  const evid1Id = `art-evid-001-${runSuffix}`;
  const evid2Id = `art-evid-002-${runSuffix}`;
  const gateId = `gate-release-${runSuffix}`;

  // 2. Ingest Requirement (REQ-AUTH-*)
  console.log(chalk.yellow(`\n[2/7] Layer 02: Ingesting Structured Requirement (${reqCode})...`));
  const reqAuth: RequirementArtifact = {
    id: reqId,
    type: "REQUIREMENT",
    code: reqCode,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: "agent-product-manager-01",
    authorRole: "PRODUCT_MANAGER",
    title: "Secure JWT Authentication with Rate Limiting",
    objective: "Authenticate API consumers using HMAC-SHA256 JWT tokens with IP-based rate limiting.",
    actor: "API Consumer",
    trigger: "POST /v1/auth/token with credentials",
    preconditions: ["Client credentials exist in store", "Client is not blacklisted"],
    workflow: [
      "Validate client_id and secret",
      "Verify rate limit token bucket",
      "Issue 15-minute signed JWT token",
    ],
    expectedResult: "Return 200 OK with access_token and refresh_token",
    edgeCases: ["Expired token", "Malformed signature", "Brute-force attempts > 5 req/sec"],
    constraints: ["Token expiry must not exceed 900 seconds", "Secrets must never be logged"],
    acceptanceCriteria: [
      "AC1: Valid credentials return HTTP 200 with JWT payload",
      "AC2: Invalid signature returns HTTP 401 Unauthorized",
      "AC3: Rate limit exceeded returns HTTP 429 Too Many Requests",
    ],
    verificationMethod: "Automated Integration Test Suite + Independent Security Audit",
    riskLevel: "HIGH",
    completenessRadar: {
      functional: 0.95,
      ux: 0.85,
      data: 0.9,
      security: 0.95,
      operational: 0.9,
      errorHandling: 0.9,
      compliance: 0.85,
      observability: 0.9,
    },
    explicitUnknowns: [],
    status: "VALIDATED",
    dependencies: [],
    tags: ["security", "auth", "api"],
    immutable: true,
  };

  await os.artifactStore.put(reqAuth);
  await os.eventBus.publish({
    id: `evt-req-${Date.now()}`,
    type: "REQUIREMENT_CREATED",
    actorId: reqAuth.authorId,
    actorRole: reqAuth.authorRole,
    payload: { code: reqAuth.code, title: reqAuth.title, risk: reqAuth.riskLevel },
  });
  console.log(chalk.green(`  ✓ Requirement ${reqAuth.code} stored with SHA-256: ${os.artifactStore.get(reqAuth.id).sha256Hash?.substring(0, 16)}...`));

  // 3. Register Architectural Decision (ADR-*)
  console.log(chalk.yellow(`\n[3/7] Layer 04: Recording Architecture Decision Record (${adrCode})...`));
  const adrAuth: ADRArtifact = {
    id: adrId,
    type: "ADR",
    code: adrCode,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: "agent-system-architect-01",
    authorRole: "SYSTEM_ARCHITECT",
    title: "Use Redis Token Bucket for Auth Rate Limiting",
    status: "ACCEPTED",
    contextAndProblem: "Need low-latency, distributed rate limiting for auth endpoints.",
    decision: "Adopt Redis sliding-window token bucket algorithm with 100ms TTL.",
    alternativesConsidered: [
      { name: "In-Memory Map", pros: ["Zero external dependency"], cons: ["Fails on multi-instance scaling"] },
      { name: "PostgreSQL Row Counter", pros: ["Reuses existing DB"], cons: ["High DB lock contention"] },
    ],
    consequencesPositive: ["Sub-millisecond rate check", "Scales across multiple worker pods"],
    consequencesNegative: ["Introduces Redis infrastructure dependency"],
    assumptions: ["Redis instance has >99.99% availability"],
    affectedRequirements: [reqCode],
    securityConsiderations: "Redis keys prefixed with auth:ratelimit: to isolate namespace.",
    dependencies: [reqAuth.id],
    tags: ["architecture", "adr", "redis"],
    immutable: true,
  };

  await os.artifactStore.put(adrAuth);
  console.log(chalk.green(`  ✓ ADR ${adrAuth.code} accepted and linked to ${reqAuth.code}`));

  // 4. Create Task & Isolated Git Worktree Sandbox
  console.log(chalk.yellow(`\n[4/7] Layer 07: Dispatching Task & Spawning Git Worktree Sandbox (${taskId})...`));
  const taskAuth: TaskNodeArtifact = {
    id: taskArtId,
    type: "TASK_NODE",
    code: taskId,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: "agent-backend-builder-01",
    authorRole: "BACKEND_ENGINEER",
    title: "Implement JWT Token Generator & Verification Module",
    description: "Write JWT signing, verification, and token extraction functions.",
    assignedRole: "BACKEND_ENGINEER",
    assignedModelTier: "TIER_HIGH_REASONING",
    targetRequirementCode: reqCode,
    isolationBranch: `hellx/task/${taskId}`,
    status: "RUNNING",
    executionProofRequired: ["UNIT_TEST_OUTPUT", "SECURITY_SCAN_REPORT"],
    retryCount: 0,
    costUsd: 0.045,
    dependencies: [reqAuth.id, adrAuth.id],
    tags: ["execution", "backend"],
    immutable: false,
  };

  await os.artifactStore.put(taskAuth);

  let worktreeCreated = false;
  let worktreePath = "";
  try {
    const wt = os.worktreeManager.createWorktree({
      taskId: taskId,
      branchName: taskAuth.isolationBranch,
    });
    worktreeCreated = true;
    worktreePath = wt.worktreePath;
    console.log(chalk.green(`  ✓ Git Worktree created at: ${worktreePath}`));
    console.log(chalk.green(`  ✓ Isolated branch: ${wt.branchName}`));
  } catch (err: any) {
    console.log(chalk.cyan(`  ℹ Worktree creation note: ${err.message}`));
  }

  // 5. Test Least Privilege Sandbox Policy
  console.log(chalk.yellow("\n[5/7] Layer 07: Testing Sandbox Boundary & Least Privilege Policies..."));
  try {
    os.sandboxPolicy.validateFileAccess({
      targetFilePath: path.join(workspaceRoot, ".env.production"),
      worktreeRoot: workspaceRoot,
      role: "BACKEND_ENGINEER",
      accessType: "WRITE",
    });
    console.log(chalk.red("  ✗ Security Failure: Secret path write was not blocked!"));
    return false;
  } catch (err: any) {
    console.log(chalk.green(`  ✓ Security Success: Blocked unauthorized access: ${err.message}`));
  }

  // 6. Test Primary Principle (No Builder Self-Review)
  console.log(chalk.yellow("\n[6/7] Layer 08: Testing Primary Principle (Self-Review Prohibition)..."));
  try {
    os.policyEngine.validateIndependentVerification(
      "agent-backend-builder-01", // Builder
      "agent-backend-builder-01", // Self-Review Attempt
      reqAuth.id
    );
    console.log(chalk.red("  ✗ Governance Failure: Self-review was allowed!"));
    return false;
  } catch (err: any) {
    if (err instanceof SelfReviewViolationError) {
      console.log(chalk.green(`  ✓ Governance Success: Primary Principle Enforced!`));
      console.log(chalk.dim(`    → ${err.message}`));
    }
  }

  // 7. Independent Verifier Submits Evidence & Release Gate Evaluated
  console.log(chalk.yellow("\n[7/7] Layer 08 & 09: Independent Verification & Release Gate..."));
  const independentEvidence: EvidenceArtifact = {
    id: evid1Id,
    type: "EVIDENCE",
    code: `EVID-UNIT-${runSuffix}`,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: "agent-qa-verifier-99",
    authorRole: "QA_ENGINEER",
    evidenceType: "UNIT_TEST_OUTPUT",
    targetRequirementCode: reqCode,
    targetTaskId: taskAuth.id,
    rawPayload: {
      testSuite: "auth-jwt.test.ts",
      totalTests: 14,
      passed: 14,
      failed: 0,
      coveragePct: 98.4,
    },
    reproducibleCommand: "npm test -- tests/auth.test.ts",
    verifiedPassed: true,
    verifierAgentId: "agent-qa-verifier-99", // Independent from builder
    verifierModelIdentifier: "claude-3-5-sonnet",
    verifierSignature: "sig_rsa_sha256_verifier_99_valid",
    dependencies: [taskAuth.id, reqAuth.id],
    tags: ["evidence", "unit-test"],
    immutable: true,
  };

  const securityScanEvidence: EvidenceArtifact = {
    id: evid2Id,
    type: "EVIDENCE",
    code: `EVID-SEC-${runSuffix}`,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: "agent-security-scanner-02",
    authorRole: "SECURITY_TESTER",
    evidenceType: "SECURITY_SCAN_REPORT",
    targetRequirementCode: reqCode,
    targetTaskId: taskAuth.id,
    rawPayload: {
      vulnerabilitiesFound: 0,
      jwtAlgorithmEnforced: "HS256",
      secretEntropyBits: 256,
    },
    reproducibleCommand: "semgrep --config=p/jwt",
    verifiedPassed: true,
    verifierAgentId: "agent-security-scanner-02",
    verifierModelIdentifier: "claude-3-5-sonnet",
    verifierSignature: "sig_sec_scan_02_valid",
    dependencies: [taskAuth.id, reqAuth.id],
    tags: ["evidence", "security-scan"],
    immutable: true,
  };

  await os.artifactStore.put(independentEvidence);
  await os.artifactStore.put(securityScanEvidence);

  const gateResult = await os.gateEvaluator.evaluateReleaseGate({
    gateId: gateId,
    requirementCode: reqCode,
    evaluatorActor: {
      id: "actor-release-lead-01",
      name: "Autonomous Release Authority",
      type: "SYSTEM_EVALUATOR",
      role: "RELEASE_AUTHORITY",
      permissions: ["GATE_APPROVE"],
    },
    justification: "All mandatory execution proofs (Unit Tests + Security Scans) independently verified.",
  });

  console.log(chalk.green(`  ✓ Release Gate Status: ${chalk.bold(gateResult.status)}`));
  console.log(chalk.green(`  ✓ Attached Evidence IDs: [${gateResult.attachedEvidenceIds.join(", ")}]`));
  console.log(chalk.green(`  ✓ Event Chain Integrity: ${os.eventBus.verifyChainIntegrity() ? "VALID (100% Cryptographic Match)" : "INVALID"}`));

  // Cleanup worktree
  if (worktreeCreated) {
    os.worktreeManager.removeWorktree(taskId, true);
    console.log(chalk.dim(`  ✓ Cleaned up test Git worktree (${taskId}).`));
  }

  console.log(chalk.bold.green("\n================================================================="));
  console.log(chalk.bold.green("   ✨ PHASE 0 SUBSTRATE SIMULATION COMPLETED SUCCESSFULLY! ✨   "));
  console.log(chalk.bold.green("=================================================================\n"));

  return true;
}

if (process.argv[1]?.endsWith("simulate.ts")) {
  runSimulation().catch((err) => {
    console.error(chalk.red("Simulation failed:"), err);
    process.exit(1);
  });
}
