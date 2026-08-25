/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Command Line Interface & Control Plane
 */

import { Command } from "commander";
import chalk from "chalk";
import { EngineeringOS } from "../core/engine.js";
import { runSimulation } from "./simulate.js";

export function createCli(): Command {
  const program = new Command();

  program
    .name("hellx")
    .description("Hell-x: The AI-Native Operating System for Software Engineering")
    .version("0.1.0");

  program
    .command("init")
    .description("Initialize Hell-x Engineering OS in the current repository")
    .action(async () => {
      const os = new EngineeringOS();
      await os.initialize();
      console.log(chalk.green(`✓ Hell-x Engineering OS Substrate initialized.`));
      console.log(chalk.cyan(`Project ID: ${os.getMetadata().id}`));
      console.log(chalk.cyan(`Storage Directory: ${os.getConfig().storageDir}`));
    });

  program
    .command("status")
    .description("Display system health, artifact counts, and audit event stream")
    .action(async () => {
      const os = new EngineeringOS();
      await os.initialize();
      const meta = os.getMetadata();
      const artifacts = os.artifactStore.getAll();
      const events = os.eventBus.getEvents();
      const isIntegrityValid = os.eventBus.verifyChainIntegrity();

      console.log(chalk.bold.cyan("\n--- HELL-X ENGINEERING OS STATUS ---"));
      console.log(`Project Name:     ${chalk.bold(meta.name)} (${meta.id})`);
      console.log(`Current State:    ${chalk.yellow(meta.currentState)}`);
      console.log(`Total Artifacts:  ${chalk.green(artifacts.length)}`);
      console.log(`Total Events:     ${chalk.green(events.length)}`);
      console.log(`Event Integrity:  ${isIntegrityValid ? chalk.green("VALID (SHA-256 Chain Intact)") : chalk.red("COMPROMISED")}`);
      console.log(`Total AI Cost:    ${chalk.cyan("$" + os.modelRouter.getCostTracker().getTotalCost().toFixed(4))}`);
      console.log(chalk.bold.cyan("-------------------------------------\n"));
    });

  program
    .command("simulate")
    .description("Run the Phase 0 end-to-end substrate simulation")
    .action(async () => {
      await runSimulation();
    });

  program
    .command("simulate-phase1")
    .description("Run the Phase 1 Intent → Specification Engine simulation")
    .action(async () => {
      const { runPhase1Simulation } = await import("./simulate-phase1.js");
      await runPhase1Simulation();
    });

  program
    .command("intent <prompt>")
    .description("Ingest raw natural language prompt and extract structured intent")
    .action(async (prompt: string) => {
      const { IntentParser } = await import("../intent/parser.js");
      const { RequirementGenerator } = await import("../requirements/generator.js");
      const parser = new IntentParser();
      const generator = new RequirementGenerator();
      
      const intent = await parser.parseIntent(prompt);
      console.log(chalk.bold.cyan("\n--- EXTRACTED INTENT VECTOR ---"));
      console.log(chalk.green(`Domain:           ${intent.targetDomain}`));
      console.log(chalk.green(`Ambiguity:        ${(intent.ambiguityScore * 100).toFixed(0)}%`));
      console.log(chalk.green(`Problem:          ${intent.problemStatement}`));
      console.log(chalk.green(`Actors:           ${intent.actors.map((a) => a.name).join(", ")}`));
      console.log(chalk.green(`Constraints:      ${intent.constraints.length}`));
      console.log(chalk.green(`Risks:            ${intent.risks.length}`));
      
      const reqs = generator.generateRequirements(intent);
      console.log(chalk.bold.cyan("\n--- GENERATED REQUIREMENTS ---"));
      for (const r of reqs) {
        console.log(chalk.yellow(`• [${r.code}] ${r.title} (Risk: ${r.riskLevel})`));
      }
      console.log("");
    });

  program
    .command("reqs")
    .description("Inspect and analyze requirement artifacts")
    .option("-a, --analyze", "Run contradiction detection and 10D completeness analysis")
    .action(async (options) => {
      const os = new EngineeringOS();
      await os.initialize();
      const { CompletenessEngine } = await import("../requirements/completeness.js");
      const { ConflictDetector } = await import("../requirements/conflict-detector.js");
      const completeness = new CompletenessEngine();
      const detector = new ConflictDetector();

      const reqs = os.artifactStore.getByType<any>("REQUIREMENT");
      console.log(chalk.bold.cyan(`\nFound ${reqs.length} Requirement Artifacts:`));
      for (const r of reqs) {
        const rep = completeness.evaluateCompleteness(r);
        console.log(chalk.yellow(`• [${r.code}] ${r.title} | Completeness: ${(rep.overallScore * 100).toFixed(0)}%`));
      }

      if (options.analyze && reqs.length > 1) {
        const conflicts = detector.detectConflicts(reqs);
        console.log(chalk.bold.cyan(`\nCross-Requirement Conflict Analysis:`));
        if (conflicts.length === 0) {
          console.log(chalk.green(`✓ Zero cross-requirement conflicts detected.`));
        } else {
          for (const c of conflicts) {
            console.log(chalk.red(`⚠️ [${c.type}] ${c.requirementACode} vs ${c.requirementBCode}: ${c.explanation}`));
          }
        }
      }
      console.log("");
    });

  program
    .command("simulate-phase2")
    .description("Run the Phase 2 Blueprint & Architecture Engine simulation")
    .action(async () => {
      const { runPhase2Simulation } = await import("./simulate-phase2.js");
      await runPhase2Simulation();
    });

  program
    .command("blueprint")
    .description("Synthesize full architecture blueprint from validated requirements")
    .action(async () => {
      const os = new EngineeringOS();
      await os.initialize();
      const { DomainModeler } = await import("../blueprint/domain-modeler.js");
      const { APIGenerator } = await import("../blueprint/api-generator.js");
      const { DataModeler } = await import("../blueprint/data-modeler.js");
      const modeler = new DomainModeler();
      const apiGen = new APIGenerator();
      const dataModeler = new DataModeler();

      const reqs = os.artifactStore.getByType<any>("REQUIREMENT");
      const { boundedContexts, entities } = modeler.modelDomain(reqs);
      const apis = apiGen.generateContracts(entities);
      const dbs = dataModeler.generateSchemas(entities);

      console.log(chalk.bold.blue("\n--- ARCHITECTURE BLUEPRINT SUMMARY ---"));
      console.log(chalk.green(`Bounded Contexts:  [${boundedContexts.join(", ")}]`));
      console.log(chalk.green(`Domain Entities:   ${entities.length} synthesized`));
      console.log(chalk.green(`API Contracts:     ${apis.length} endpoints defined`));
      console.log(chalk.green(`Database Tables:   ${dbs.length} tables generated`));
      console.log("");
    });

  program
    .command("graph")
    .description("Inspect Engineering Dependency DAG and parallel execution tiers")
    .action(async () => {
      const { runPhase2Simulation } = await import("./simulate-phase2.js");
      await runPhase2Simulation();
    });

  program
    .command("simulate-phase3")
    .description("Run the Phase 3 Design Engine & UX Loop simulation")
    .action(async () => {
      const { runPhase3Simulation } = await import("./simulate-phase3.js");
      await runPhase3Simulation();
    });

  program
    .command("design")
    .description("Inspect synthesized screen models and design tokens")
    .action(async () => {
      const os = new EngineeringOS();
      await os.initialize();
      const { ScreenModeler } = await import("../design/screen-modeler.js");
      const { TokenEngine } = await import("../design/token-engine.js");
      const screenModeler = new ScreenModeler();
      const tokenEngine = new TokenEngine();

      const reqs = os.artifactStore.getByType<any>("REQUIREMENT");
      const screens = screenModeler.modelScreens(reqs);
      const tokens = tokenEngine.getTokens();

      console.log(chalk.bold.hex("#ec4899")("\n--- DESIGN SYSTEM & SCREENS ---"));
      console.log(chalk.green(`Primary Color:     ${tokens.colors.primary}`));
      console.log(chalk.green(`Background Color:  ${tokens.colors.background}`));
      console.log(chalk.green(`Synthesized Screens: ${screens.length}`));
      for (const s of screens) {
        console.log(chalk.yellow(`• [${s.routePath}] ${s.name} (${s.components.length} components)`));
      }
      console.log("");
    });

  program
    .command("simulate-phase4")
    .description("Run the Phase 4 Agent Workforce & Task Graph simulation")
    .action(async () => {
      const { runPhase4Simulation } = await import("./simulate-phase4.js");
      await runPhase4Simulation();
    });

  program
    .command("workforce")
    .description("List specialist engineering roles and operational boundaries")
    .action(async () => {
      const { SPECIALIST_ROLES } = await import("../workforce/roles.js");
      console.log(chalk.bold.hex("#8b5cf6")("\n--- SPECIALIST ENGINEERING WORKFORCE ---"));
      for (const [key, roleSpec] of Object.entries(SPECIALIST_ROLES)) {
        console.log(chalk.green(`• [${roleSpec.role}] ${roleSpec.title}`));
        console.log(chalk.dim(`  Focus: ${roleSpec.focusArea}`));
        console.log(chalk.cyan(`  Allowed: [${roleSpec.allowedPermissions.join(", ")}]`));
        console.log(chalk.red(`  Forbidden: [${roleSpec.forbiddenActions.join(", ")}]`));
      }
      console.log("");
    });

  program
    .command("simulate-phase5")
    .description("Run the Phase 5 Verification Engine & Evidence Network simulation")
    .action(async () => {
      const { runPhase5Simulation } = await import("./simulate-phase5.js");
      await runPhase5Simulation();
    });

  program
    .command("verify")
    .description("Audit evidence artifacts, security scans, and claim-proof reconciliation")
    .action(async () => {
      const os = new EngineeringOS();
      await os.initialize();
      const evidence = os.artifactStore.getByType<any>("EVIDENCE");
      console.log(chalk.bold.hex("#10b981")("\n--- EVIDENCE NETWORK & PROOFS ---"));
      console.log(chalk.green(`Stored Evidence Artifacts: ${evidence.length}`));
      for (const e of evidence) {
        console.log(chalk.yellow(`• [${e.code}] ${e.evidenceType} | Passed: ${e.verifiedPassed} | Sig: ${e.verifierSignature.slice(0, 16)}...`));
      }
      console.log("");
    });

  program
    .command("simulate-phase6")
    .description("Run the Phase 6 Release Engine & Deployment State Machine simulation")
    .action(async () => {
      const { runPhase6Simulation } = await import("./simulate-phase6.js");
      await runPhase6Simulation();
    });

  program
    .command("release")
    .description("Inspect release plans and failure memory post-mortems")
    .action(async () => {
      const os = new EngineeringOS();
      await os.initialize();
      const memories = os.artifactStore.getByType<any>("MEMORY");
      console.log(chalk.bold.hex("#f59e0b")("\n--- RELEASE MEMORIES & INCIDENT POST-MORTEMS ---"));
      console.log(chalk.green(`Stored Post-Mortem Records: ${memories.length}`));
      for (const m of memories) {
        console.log(chalk.yellow(`• [${m.code}] (${m.category}) ${m.summary}`));
      }
      console.log("");
    });

  program
    .command("simulate-phase7")
    .description("Run the Phase 7 Continuous Memory, Learning & Observability simulation")
    .action(async () => {
      const { runPhase7Simulation } = await import("./simulate-phase7.js");
      await runPhase7Simulation();
    });

  program
    .command("memory")
    .description("Inspect 8-tier hierarchical memories and distilled preventative rules")
    .action(async () => {
      const os = new EngineeringOS();
      await os.initialize();
      const memories = os.artifactStore.getByType<any>("MEMORY");
      console.log(chalk.bold.hex("#06b6d4")("\n--- HIERARCHICAL MEMORY SUBSTRATE ---"));
      console.log(chalk.green(`Indexed Memory Records: ${memories.length}`));
      for (const m of memories) {
        console.log(chalk.yellow(`• [${m.code}] (${m.category}) ${m.summary} (Reinforcement: ${m.reinforcementScore || 1.0})`));
      }
      console.log("");
    });

  program
    .command("simulate-phase8")
    .description("Run the complete Phase 8 Autonomous Closed-Loop Engineering simulation")
    .action(async () => {
      const { runPhase8Simulation } = await import("./simulate-phase8.js");
      await runPhase8Simulation();
    });

  program
    .command("mission <intent>")
    .description("Execute an end-to-end autonomous engineering mission from user intent")
    .action(async (intent: string) => {
      const os = new EngineeringOS();
      await os.initialize();
      const { MissionControlOrchestrator } = await import("../mission/mission-orchestrator.js");
      const orchestrator = new MissionControlOrchestrator(os);
      console.log(chalk.bold.hex("#ec4899")(`\n--- EXECUTING AUTONOMOUS MISSION: "${intent}" ---`));
      const res = await orchestrator.executeMission(intent);
      console.log(chalk.green(`\nMission Result: ${res.success ? "SUCCESS" : "FAILED"} (Gates Passed: ${res.passedGates.length}/6)`));
      console.log("");
    });

  program
    .command("simulate-providers")
    .description("Run the Milestone 9 Live Providers & CI/CD sync simulation")
    .action(async () => {
      const { runProvidersSimulation } = await import("./simulate-providers.js");
      await runProvidersSimulation();
    });

  program
    .command("serve")
    .description("Start the Mission Control REST API Server & Web Dashboard")
    .option("-p, --port <port>", "Port to bind", "3000")
    .action(async (options: { port: string }) => {
      const os = new EngineeringOS();
      await os.initialize();
      const { MissionControlServer } = await import("../server/api-server.js");
      const server = new MissionControlServer(os, { port: parseInt(options.port, 10) });
      const boundPort = await server.start();
      console.log(chalk.bold.hex("#8b5cf6")(`\n🚀 Hell-x Mission Control Dashboard live at: http://localhost:${boundPort}`));
      console.log(chalk.dim("Press Ctrl+C to stop server.\n"));
    });

  program
    .command("simulate-dashboard")
    .description("Run the Milestone 10 Mission Control Server & Dashboard simulation")
    .action(async () => {
      const { runDashboardSimulation } = await import("./simulate-dashboard.js");
      await runDashboardSimulation();
    });

  program
    .command("simulate-enterprise")
    .description("Run the Milestone 11 Enterprise Security, SLSA Attestation & Multi-Sig Gate simulation")
    .action(async () => {
      const { runEnterpriseSimulation } = await import("./simulate-enterprise.js");
      await runEnterpriseSimulation();
    });

  program
    .command("simulate-grand-pilot")
    .description("Run the Milestone 12 Grand Capstone Swarm & Autonomous Self-Healing simulation")
    .action(async () => {
      const { runGrandPilotSimulation } = await import("./simulate-grand-pilot.js");
      await runGrandPilotSimulation();
    });

  program
    .command("swarm")
    .description("Inspect active multi-agent swarm topologies and consensus states")
    .action(async () => {
      const { runGrandPilotSimulation } = await import("./simulate-grand-pilot.js");
      await runGrandPilotSimulation();
    });

  program
    .command("simulate-twin")
    .description("Run Milestone 13 Digital Twin, Blast Radius, Adversarial Red-Team Debate & Outcome Missions simulation")
    .action(async () => {
      const { runTwinDebateSimulation } = await import("./simulate-twin-debate.js");
      await runTwinDebateSimulation();
    });

  program
    .command("debate")
    .description("Trigger an adversarial Red-Team vs Blue-Team dialectic debate on architectural proposals")
    .action(async () => {
      const { runTwinDebateSimulation } = await import("./simulate-twin-debate.js");
      await runTwinDebateSimulation();
    });

  program
    .command("simulate-economy")
    .description("Run Milestone 14 Cost Intelligence, 11D Engineering Score, Health Model & Adaptive Workflows")
    .action(async () => {
      const { runEconomyScoringSimulation } = await import("./simulate-economy-scoring.js");
      await runEconomyScoringSimulation();
    });

  program
    .command("score")
    .description("Calculate comprehensive 11-dimensional evidence-linked engineering score")
    .action(async () => {
      const { runEconomyScoringSimulation } = await import("./simulate-economy-scoring.js");
      await runEconomyScoringSimulation();
    });

  return program;
}

if (
  process.argv[1]?.endsWith("index.ts") ||
  process.argv[1]?.endsWith("hellx.ts") ||
  process.argv[1]?.endsWith("index.js") ||
  process.argv[1]?.endsWith("hellx.js")
) {
  createCli().parse(process.argv);
}
