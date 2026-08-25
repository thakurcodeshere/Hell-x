/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 2 End-to-End Simulation: Specification → Blueprint & Architecture Engine
 */

import chalk from "chalk";
import { EngineeringOS } from "../core/engine.js";
import { DomainModeler } from "../blueprint/domain-modeler.js";
import { ADREngine } from "../blueprint/adr-engine.js";
import { APIGenerator } from "../blueprint/api-generator.js";
import { DataModeler } from "../blueprint/data-modeler.js";
import { SecurityModeler } from "../blueprint/security-modeler.js";
import { DAGEngine } from "../graph/dag-engine.js";
import { ImpactEngine } from "../graph/impact-engine.js";
import { ArchitectureGateEvaluator } from "../governance/arch-gate.js";
import { RequirementArtifact } from "../core/artifacts.js";
import { ArchitectureBlueprint } from "../blueprint/types.js";

export async function runPhase2Simulation(workspaceRoot: string = process.cwd()): Promise<boolean> {
  console.log(chalk.bold.blue("\n================================================================="));
  console.log(chalk.bold.blue(" 🏗️ HELL-X ENGINEERING OS — PHASE 2: BLUEPRINT & ARCHITECTURE 🏗️ "));
  console.log(chalk.bold.blue("=================================================================\n"));

  // 1. Initialize Substrate
  console.log(chalk.yellow("[1/7] Initializing Engineering OS Substrate..."));
  const os = new EngineeringOS({ projectRoot: workspaceRoot });
  await os.initialize();

  const domainModeler = new DomainModeler();
  const adrEngine = new ADREngine(os.artifactStore, os.eventBus);
  const apiGenerator = new APIGenerator();
  const dataModeler = new DataModeler();
  const securityModeler = new SecurityModeler();
  const dagEngine = new DAGEngine();
  const impactEngine = new ImpactEngine(dagEngine);
  const archGateEvaluator = new ArchitectureGateEvaluator(os.artifactStore, os.eventBus, dagEngine);

  console.log(chalk.green("  ✓ Substrate ready with Blueprint & Graph Engines."));

  // 2. Load Validated Requirements
  const runId = Date.now().toString().slice(-4);
  const req1Code = `REQ-PAYM-001-${runId}`;
  const req2Code = `REQ-AUTH-001-${runId}`;

  const requirements: RequirementArtifact[] = [
    {
      id: `art-req-paym-${runId}`,
      type: "REQUIREMENT",
      code: req1Code,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "pm-01",
      authorRole: "PRODUCT_MANAGER",
      title: "Payment Processing & Invoicing",
      objective: "Process charges and issue permanent audit invoices.",
      actor: "Customer",
      trigger: "POST /v1/checkout",
      preconditions: ["Valid payment credentials"],
      workflow: ["Charge card", "Create invoice"],
      expectedResult: "Charge processed",
      edgeCases: ["Card decline"],
      constraints: ["Invoices must be immutable"],
      acceptanceCriteria: ["Charge completes < 2s"],
      verificationMethod: "Integration Tests",
      riskLevel: "HIGH",
      completenessRadar: {
        functional: 0.95,
        ux: 0.85,
        data: 0.95,
        security: 0.95,
        operational: 0.9,
        errorHandling: 0.9,
        compliance: 0.95,
        observability: 0.9,
      },
      explicitUnknowns: [],
      status: "VALIDATED",
      dependencies: [],
      tags: ["payment"],
      immutable: true,
    },
    {
      id: `art-req-auth-${runId}`,
      type: "REQUIREMENT",
      code: req2Code,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "pm-01",
      authorRole: "PRODUCT_MANAGER",
      title: "Stateless JWT Authentication",
      objective: "Authenticate users with signed Ed25519 tokens.",
      actor: "User",
      trigger: "POST /v1/auth/login",
      preconditions: ["User exists"],
      workflow: ["Verify credentials", "Issue token"],
      expectedResult: "Token returned",
      edgeCases: ["Invalid password"],
      constraints: ["Expiry 15 minutes"],
      acceptanceCriteria: ["Token validated"],
      verificationMethod: "Auth Tests",
      riskLevel: "HIGH",
      completenessRadar: {
        functional: 0.95,
        ux: 0.85,
        data: 0.9,
        security: 0.95,
        operational: 0.9,
        errorHandling: 0.9,
        compliance: 0.9,
        observability: 0.9,
      },
      explicitUnknowns: [],
      status: "VALIDATED",
      dependencies: [],
      tags: ["auth"],
      immutable: true,
    },
  ];

  for (const r of requirements) {
    await os.artifactStore.put(r);
  }

  // 3. Domain Modeling (Entities & Invariants)
  console.log(chalk.yellow("\n[2/7] Layer 03: Synthesizing Domain Model & Bounded Contexts..."));
  const { boundedContexts, entities } = domainModeler.modelDomain(requirements);
  console.log(chalk.green(`  ✓ Bounded Contexts identified: [${boundedContexts.join(", ")}]`));
  console.log(chalk.green(`  ✓ Synthesized ${entities.length} Domain Entities:`));
  for (const ent of entities) {
    console.log(chalk.cyan(`    • Entity: ${chalk.bold(ent.name)} (${ent.boundedContext}) | ${ent.fields.length} Fields | ${ent.invariants.length} Invariants`));
  }

  // 4. Propose and Link ADRs
  console.log(chalk.yellow("\n[3/7] Layer 04: Recording Architectural Decision Records (ADRs)..."));
  const adrs = adrEngine.generateBaselineADRs(requirements);
  for (const adr of adrs) {
    await os.artifactStore.put(adr);
    console.log(chalk.green(`  ✓ [${adr.code}] ${adr.title}`));
    console.log(chalk.dim(`    Decision: ${adr.decision}`));
    console.log(chalk.dim(`    Alternatives Considered: ${adr.alternativesConsidered.map((a) => a.name).join(" vs ")}`));
  }

  // 5. Generate API Contracts & SQL Schemas
  console.log(chalk.yellow("\n[4/7] Layer 04: Generating API Endpoint Contracts & SQL DDL Schemas..."));
  const apiContracts = apiGenerator.generateContracts(entities);
  const dbSchemas = dataModeler.generateSchemas(entities);
  const securityModel = securityModeler.generateSecurityModel(requirements);

  console.log(chalk.green(`  ✓ Generated ${apiContracts.length} REST/OpenAPI 3.1 Contracts:`));
  for (const api of apiContracts.slice(0, 3)) {
    console.log(chalk.cyan(`    • ${api.method.padEnd(6)} ${api.path.padEnd(28)} [Auth: ${api.authRequired}]`));
  }

  console.log(chalk.green(`  ✓ Generated ${dbSchemas.length} Relational SQL DDL Schemas:`));
  for (const db of dbSchemas) {
    console.log(chalk.cyan(`    • Table: ${chalk.bold(db.tableName)} (${db.columns.length} columns, ${db.indexes.length} indexes)`));
  }

  // 6. Build Engineering Dependency DAG
  console.log(chalk.yellow("\n[5/7] Layer 05: Constructing Directed Acyclic Engineering Graph (DAG)..."));
  // Add Requirements
  for (const r of requirements) {
    dagEngine.addNode({ id: r.id, code: r.code, type: "REQUIREMENT", title: r.title });
  }
  // Add ADRs
  for (const a of adrs) {
    dagEngine.addNode({ id: a.id, code: a.code, type: "ADR", title: a.title });
    dagEngine.addEdge({ id: `e-${a.id}`, sourceId: requirements[0].id, targetId: a.id, type: "JUSTIFIES" });
  }
  // Add DB Schemas
  for (const d of dbSchemas) {
    dagEngine.addNode({ id: d.id, code: d.tableName, type: "DB_SCHEMA", title: d.tableName });
    dagEngine.addEdge({ id: `e-${d.id}`, sourceId: adrs[0].id, targetId: d.id, type: "IMPLEMENTS" });
  }
  // Add APIs
  for (const api of apiContracts) {
    dagEngine.addNode({ id: api.id, code: `${api.method} ${api.path}`, type: "API_CONTRACT", title: api.summary });
    // Link to corresponding table
    const targetTable = dbSchemas.find((s) => api.path.includes(s.tableName));
    if (targetTable) {
      dagEngine.addEdge({ id: `e-${api.id}`, sourceId: targetTable.id, targetId: api.id, type: "DEPENDS_ON" });
    }
  }

  console.log(chalk.green(`  ✓ Engineering DAG constructed: ${dagEngine.getAllNodes().length} Nodes, ${dagEngine.getAllEdges().length} Edges.`));
  console.log(chalk.green(`  ✓ Cycle Verification: ${dagEngine.hasCycle() ? "FAIL (Cycle detected)" : "PASSED (Strictly Acyclic)"}`));

  // Calculate Parallel Execution Tiers
  const executionTiers = dagEngine.getParallelExecutionTiers();
  console.log(chalk.yellow(`\n  ⚡ Calculated ${executionTiers.length} Parallel Execution Tiers:`));
  for (const tier of executionTiers) {
    console.log(chalk.cyan(`    [Tier ${tier.tierNumber}] → ${tier.parallelExecutableNodes.map((n) => `${n.type}:${n.code}`).join(", ")}`));
  }

  // 7. Impact Analysis (Blast Radius)
  console.log(chalk.yellow("\n[6/7] Section 28: Running Pre-Execution Blast Radius & Impact Analysis..."));
  const impact = impactEngine.analyzeImpact(requirements[0].id);
  console.log(chalk.green(`  ✓ Target Node: ${impact.targetNodeCode} (${impact.targetNodeType})`));
  console.log(chalk.cyan(`    - Direct Downstream:     ${impact.directDownstreamDependents.map((n) => n.code).join(", ")}`));
  console.log(chalk.cyan(`    - Affected Tables:       ${impact.affectedTables.join(", ")}`));
  console.log(chalk.cyan(`    - Affected API Contracts:${impact.affectedAPIs.slice(0, 3).join(", ")}...`));
  console.log(chalk.cyan(`    - Total Blast Radius:    ${impact.transitiveBlastRadius.length} downstream components`));
  console.log(chalk.magenta(`    - Impact Risk Rating:    ${chalk.bold(impact.riskRating)}`));

  // 8. Architecture Gate Evaluation
  console.log(chalk.yellow("\n[7/7] Layer 09: Evaluating Architecture Gate for Execution Promotion..."));
  const blueprint: ArchitectureBlueprint = {
    id: `blue-${runId}`,
    projectId: os.getMetadata().id,
    version: 1,
    boundedContexts,
    entities,
    adrs,
    apiContracts,
    databaseSchemas: dbSchemas,
    securityModel,
    traceRequirementCodes: requirements.map((r) => r.code),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const gateResult = await archGateEvaluator.evaluateArchitectureReadiness({
    gateId: `gate-arch-${runId}`,
    blueprint,
    evaluatorActor: {
      id: "actor-chief-architect-01",
      name: "Chief Enterprise Architect",
      type: "SYSTEM_EVALUATOR",
      role: "SYSTEM_ARCHITECT",
      permissions: ["GATE_APPROVE"],
    },
    justification: "Complete domain models, ADRs, and 100% component-to-requirement traceability with zero DAG cycles.",
  });

  console.log(chalk.green(`  ✓ Architecture Gate Status: ${chalk.bold(gateResult.status)}`));
  console.log(chalk.green(`  ✓ Evaluated Requirements: [${gateResult.evaluatedRequirements.join(", ")}]`));
  console.log(chalk.green(`  ✓ Violations: ${gateResult.violations.length === 0 ? "None (100% Clean Traceability)" : gateResult.violations.join("; ")}`));

  console.log(chalk.bold.blue("\n================================================================="));
  console.log(chalk.bold.blue(" ✨ PHASE 2: BLUEPRINT & ARCHITECTURE COMPLETED SUCCESSFULLY! ✨ "));
  console.log(chalk.bold.blue("=================================================================\n"));

  return true;
}

if (process.argv[1]?.endsWith("simulate-phase2.ts")) {
  runPhase2Simulation().catch((err) => {
    console.error(chalk.red("Phase 2 simulation failed:"), err);
    process.exit(1);
  });
}
