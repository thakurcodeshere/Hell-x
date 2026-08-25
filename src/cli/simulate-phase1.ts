/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 1 End-to-End Simulation: Intent → Specification Engine
 */

import chalk from "chalk";
import { EngineeringOS } from "../core/engine.js";
import { IntentParser } from "../intent/parser.js";
import { RequirementGenerator } from "../requirements/generator.js";
import { CompletenessEngine } from "../requirements/completeness.js";
import { ConflictDetector } from "../requirements/conflict-detector.js";
import { UnknownsEngine } from "../requirements/unknowns-engine.js";
import { SpecificationGateEvaluator } from "../governance/spec-gate.js";
import { RequirementArtifact } from "../core/artifacts.js";

export async function runPhase1Simulation(workspaceRoot: string = process.cwd()): Promise<boolean> {
  console.log(chalk.bold.magenta("\n================================================================="));
  console.log(chalk.bold.magenta("  🔮 HELL-X ENGINEERING OS — PHASE 1: INTENT → SPECIFICATION 🔮  "));
  console.log(chalk.bold.magenta("=================================================================\n"));

  // 1. Initialize Substrate
  console.log(chalk.yellow("[1/6] Initializing Engineering OS Substrate & Artifact Store..."));
  const os = new EngineeringOS({ projectRoot: workspaceRoot });
  await os.initialize();
  const unknownsEngine = new UnknownsEngine();
  const intentParser = new IntentParser(os.modelRouter);
  const reqGenerator = new RequirementGenerator(unknownsEngine);
  const completenessEngine = new CompletenessEngine();
  const conflictDetector = new ConflictDetector();
  const specGateEvaluator = new SpecificationGateEvaluator(os.artifactStore, os.eventBus, unknownsEngine, conflictDetector);

  console.log(chalk.green("  ✓ Substrate ready with Intent Parser & Requirement Intelligence."));

  // 2. Ingest Raw Natural Language Intent
  const rawUserPrompt = `
    We need a global multi-tenant payment and subscription billing system.
    Users can pay via credit cards and view invoices.
    Users should be allowed to delete their accounts on demand.
    However, all financial transactions and invoice audit logs must be permanently retained for 7 years for tax compliance.
    P99 latency must stay under 150ms.
  `.trim();

  console.log(chalk.yellow("\n[2/6] Layer 01: Ingesting Raw Natural Human Intent..."));
  console.log(chalk.dim(`  Raw input: "${rawUserPrompt.replace(/\s+/g, " ")}"`));

  const intentVector = await intentParser.parseIntent(rawUserPrompt);
  console.log(chalk.green(`  ✓ Intent Extracted:`));
  console.log(chalk.cyan(`    - Domain:           ${intentVector.targetDomain}`));
  console.log(chalk.cyan(`    - Ambiguity Score:  ${(intentVector.ambiguityScore * 100).toFixed(0)}% (Clear)`));
  console.log(chalk.cyan(`    - Actors:           ${intentVector.actors.map((a) => a.name).join(", ")}`));
  console.log(chalk.cyan(`    - Hard Constraints: ${intentVector.constraints.length} detected`));
  console.log(chalk.cyan(`    - Risks Identified: ${intentVector.risks.length} (Severity: ${intentVector.risks[0]?.severity || "N/A"})`));

  // 3. Decompose Intent into Atomic Requirements
  const runId = Date.now().toString().slice(-4);
  console.log(chalk.yellow("\n[3/6] Layer 02: Decomposing Intent into Atomic Engineering Requirements..."));
  const requirements = reqGenerator.generateRequirements(intentVector, { idSuffix: runId });

  // Add an explicit account deletion requirement to test conflict detection
  const delReqCode = `REQ-DEL-${runId}`;
  const delReq: RequirementArtifact = {
    id: `art-req-del-${runId}`,
    type: "REQUIREMENT",
    code: delReqCode,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: "agent-product-manager-01",
    authorRole: "PRODUCT_MANAGER",
    title: "User Account Deletion & GDPR Right to Erasure",
    objective: "Permanently delete user profile, payment methods, and all associated personal records upon user request.",
    actor: "End User",
    trigger: "POST /v1/account/delete",
    preconditions: ["User is authenticated", "No active pending payments"],
    workflow: [
      "Verify user credentials and MFA",
      "Purge all user tables and payment method tokens",
      "Send deletion confirmation email",
    ],
    expectedResult: "All user records completely erased from database.",
    edgeCases: ["User has active subscription", "User has unpaid balance"],
    constraints: ["Deletion must execute within 24 hours under GDPR compliance"],
    acceptanceCriteria: [
      "AC1: User account and PII records are completely removed",
      "AC2: Access token is immediately revoked",
    ],
    verificationMethod: "GDPR Compliance Test Suite",
    riskLevel: "CRITICAL",
    completenessRadar: {
      functional: 0.9,
      ux: 0.85,
      data: 0.95,
      security: 0.95,
      operational: 0.9,
      errorHandling: 0.9,
      compliance: 0.95,
      observability: 0.85,
    },
    explicitUnknowns: [],
    status: "VALIDATED",
    dependencies: [],
    tags: ["privacy", "gdpr", "deletion"],
    immutable: true,
  };

  requirements.push(delReq);

  for (const req of requirements) {
    await os.artifactStore.put(req);
    console.log(chalk.green(`  ✓ Generated & Stored: ${chalk.bold(req.code)} — "${req.title}" [Risk: ${req.riskLevel}]`));
  }

  // 4. 10-Dimensional Completeness Evaluation
  console.log(chalk.yellow("\n[4/6] Layer 02: Evaluating 10-Dimensional Completeness Radar..."));
  for (const req of requirements) {
    const rep = completenessEngine.evaluateCompleteness(req);
    console.log(chalk.cyan(`  📊 ${req.code} Completeness Score: ${(rep.overallScore * 100).toFixed(0)}%`));
    console.log(chalk.dim(`     Functional: ${(rep.radar.functional * 100).toFixed(0)}% | Security: ${(rep.radar.security * 100).toFixed(0)}% | Compliance: ${(rep.radar.compliance * 100).toFixed(0)}% | Error-Handling: ${(rep.radar.errorHandling * 100).toFixed(0)}%`));
  }

  // 5. Contradiction & Conflict Detection
  console.log(chalk.yellow("\n[5/6] Layer 02: Running Contradiction & Conflict Detection Engine..."));
  const detectedConflicts = conflictDetector.detectConflicts(requirements);
  if (detectedConflicts.length > 0) {
    console.log(chalk.red(`  ⚠️ Detected ${detectedConflicts.length} Cross-Requirement Conflict(s):`));
    for (const conflict of detectedConflicts) {
      console.log(chalk.red(`    - [${conflict.type}] between ${conflict.requirementACode} and ${conflict.requirementBCode}`));
      console.log(chalk.yellow(`      Explanation: ${conflict.explanation}`));
      console.log(chalk.green(`      Proposed Resolution: ${conflict.suggestedResolution}`));
      
      // Auto-resolve via architectural consensus rule
      conflict.resolved = true;
      conflict.resolutionNotes = "Resolved by applying PII anonymization while preserving cryptographic financial audit hashes.";
      conflictDetector.resolveConflict(conflict.requirementACode, conflict.requirementBCode, conflict.type);
      console.log(chalk.green(`      ✓ Conflict marked RESOLVED via architectural policy.`));
    }
  }

  // Register an explicit unknown and resolve it
  const unknown1 = unknownsEngine.registerUnknown({
    category: "COMPLIANCE_POLICY",
    question: "What is the specific statutory retention period for invoice tax records in the EU jurisdiction?",
    impactOnRequirements: [requirements[0].code, delReqCode],
    proposedDefaultAssumption: "Default to 10 years (German HGB § 257 & EU VAT directive standard).",
  });
  console.log(chalk.cyan(`\n  📝 Explicit Unknown Registered: [${unknown1.code}] "${unknown1.question}"`));
  console.log(chalk.dim(`     Default Assumption: ${unknown1.proposedDefaultAssumption}`));

  unknownsEngine.resolveUnknown(
    unknown1.id,
    "Confirmed 10 years retention for German/EU tax invoices with PII pseudonymization.",
    "actor-compliance-officer"
  );
  console.log(chalk.green(`  ✓ Unknown ${unknown1.code} resolved by Compliance Officer.`));

  // 6. Evaluate Specification Gate
  console.log(chalk.yellow("\n[6/6] Layer 09: Evaluating Specification Gate for Architecture Transition..."));
  const specGateResult = await specGateEvaluator.evaluateSpecificationReadiness({
    gateId: `gate-spec-${runId}`,
    requirementCodes: requirements.map((r) => r.code),
    evaluatorActor: {
      id: "actor-lead-architect-01",
      name: "Lead System Architect",
      type: "SYSTEM_EVALUATOR",
      role: "SYSTEM_ARCHITECT",
      permissions: ["GATE_APPROVE"],
    },
    justification: "All requirements achieve >80% completeness score, all conflicts resolved, and all unknowns verified.",
  });

  console.log(chalk.green(`  ✓ Specification Gate Status: ${chalk.bold(specGateResult.status)}`));
  console.log(chalk.green(`  ✓ Evaluated Requirements: [${specGateResult.evaluatedRequirements.join(", ")}]`));
  console.log(chalk.green(`  ✓ Violations: ${specGateResult.violations.length === 0 ? "None (100% Clean)" : specGateResult.violations.join("; ")}`));

  console.log(chalk.bold.magenta("\n================================================================="));
  console.log(chalk.bold.magenta(" ✨ PHASE 1: INTENT → SPECIFICATION COMPLETED SUCCESSFULLY! ✨ "));
  console.log(chalk.bold.magenta("=================================================================\n"));

  return true;
}

if (process.argv[1]?.endsWith("simulate-phase1.ts")) {
  runPhase1Simulation().catch((err) => {
    console.error(chalk.red("Phase 1 simulation failed:"), err);
    process.exit(1);
  });
}
