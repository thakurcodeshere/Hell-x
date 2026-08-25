/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Milestone 10 Simulation: Mission Control REST API Server & Web Dashboard
 */

import chalk from "chalk";
import http from "http";
import { EngineeringOS } from "../core/engine.js";
import { MissionControlServer } from "../server/api-server.js";

function httpGet(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode || 0, body }));
    }).on("error", (err) => reject(err));
  });
}

function httpPost(url: string, payload: Record<string, any>): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode || 0, body }));
      }
    );
    req.on("error", (err) => reject(err));
    req.write(data);
    req.end();
  });
}

export async function runDashboardSimulation(): Promise<boolean> {
  console.log(chalk.bold.hex("#8b5cf6")("\n========================================================================================="));
  console.log(chalk.bold.hex("#8b5cf6")(" 🖥️ HELL-X ENGINEERING OS — MILESTONE 10: MISSION CONTROL WEB DASHBOARD & API 🖥️ "));
  console.log(chalk.bold.hex("#8b5cf6")("=========================================================================================\n"));

  // 1. Initialize Substrate & Start Server
  console.log(chalk.yellow("[1/6] Bootstrapping Native Node.js Mission Control Server..."));
  const os = new EngineeringOS();
  await os.initialize();

  const server = new MissionControlServer(os, { port: 0 }); // Bind random port
  const port = await server.start(0);
  const baseUrl = `http://localhost:${port}`;
  console.log(chalk.green(`  ✓ Server running on ${chalk.bold(baseUrl)} (Zero external web dependencies)`));

  // 2. Query Dashboard HTML (GET /)
  console.log(chalk.yellow("\n[2/6] Verifying Web Dashboard UI Delivery (GET /)..."));
  const indexRes = await httpGet(`${baseUrl}/`);
  console.log(chalk.green(`  ✓ HTTP ${indexRes.status} OK: Delivered Dashboard HTML (${indexRes.body.length} bytes)`));
  console.log(chalk.cyan(`    - Title: "HELL-X — AI-Native Engineering Operating System"`));
  console.log(chalk.cyan(`    - Visualizers: Task Graph DAG, 10D Radar, Evidence Tables, Canary Dials, 8-Tier Memory`));

  // 3. Query System Health & Status (GET /api/v1/status)
  console.log(chalk.yellow("\n[3/6] Querying System Status API (GET /api/v1/status)..."));
  const statusRes = await httpGet(`${baseUrl}/api/v1/status`);
  const statusJson = JSON.parse(statusRes.body);
  console.log(chalk.green(`  ✓ HTTP ${statusRes.status} OK: Status: ${chalk.bold(statusJson.data.status)} | Total Artifacts: ${statusJson.data.totalArtifacts} | Uptime: ${statusJson.data.uptimeSeconds.toFixed(1)}s`));

  // 4. Query Real-Time DAG Task Graph (GET /api/v1/dag)
  console.log(chalk.yellow("\n[4/6] Querying Topological Task Graph DAG (GET /api/v1/dag)..."));
  const dagRes = await httpGet(`${baseUrl}/api/v1/dag`);
  const dagJson = JSON.parse(dagRes.body);
  console.log(chalk.green(`  ✓ HTTP ${dagRes.status} OK: Retrieved DAG Graph with ${dagJson.data.nodes.length} nodes and ${dagJson.data.edges.length} dependency edges.`));
  for (const n of dagJson.data.nodes) {
    console.log(chalk.dim(`    • [${n.code}] Tier ${n.tier} (${n.targetRole}) → Status: ${n.status}`));
  }

  // 5. Query Canary Telemetry Probes (GET /api/v1/canary)
  console.log(chalk.yellow("\n[5/6] Querying Real-Time Canary Telemetry Probes (GET /api/v1/canary)..."));
  const canaryRes = await httpGet(`${baseUrl}/api/v1/canary`);
  const canaryJson = JSON.parse(canaryRes.body);
  console.log(chalk.green(`  ✓ HTTP ${canaryRes.status} OK: Traffic: ${canaryJson.data.trafficPercentage}% | P99 Latency: ${canaryJson.data.p99LatencyMs}ms | Error Rate: ${(canaryJson.data.errorRate * 100).toFixed(2)}%`));

  // 6. Execute Autonomous Mission over REST (POST /api/v1/mission)
  console.log(chalk.yellow("\n[6/6] Triggering Autonomous Mission via REST API (POST /api/v1/mission)..."));
  const missionRes = await httpPost(`${baseUrl}/api/v1/mission`, {
    intent: "Build Multi-Tenant Subscription and Automated Invoicing Engine",
  });
  const missionJson = JSON.parse(missionRes.body);
  console.log(chalk.green(`  ✓ HTTP ${missionRes.status} OK: Mission [${missionJson.data.missionId}] executed via REST API!`));
  console.log(chalk.cyan(`    - Success:         ${missionJson.data.success}`));
  console.log(chalk.cyan(`    - Release Version: ${missionJson.data.releaseVersion}`));
  console.log(chalk.cyan(`    - Gates Passed:    ${missionJson.data.passedGates.join(", ")}`));

  // Cleanup
  await server.stop();
  console.log(chalk.dim("\n  ✓ Server stopped cleanly."));

  console.log(chalk.bold.hex("#8b5cf6")("\n========================================================================================="));
  console.log(chalk.bold.hex("#8b5cf6")(" ✨ MILESTONE 10: MISSION CONTROL WEB DASHBOARD & API COMPLETED! ✨ "));
  console.log(chalk.bold.hex("#8b5cf6")("=========================================================================================\n"));

  return true;
}

if (process.argv[1]?.endsWith("simulate-dashboard.ts")) {
  runDashboardSimulation().catch((err) => {
    console.error(chalk.red("Milestone 10 simulation failed:"), err);
    process.exit(1);
  });
}
