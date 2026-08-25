/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Vercel Serverless Function Entrypoint
 */

import { renderDashboardHtml } from "../src/server/dashboard-html.js";

export default function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const url = req.url || "/";

  if (url === "/" || url === "") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(renderDashboardHtml());
    return;
  }

  if (url.startsWith("/api/v1/status")) {
    res.status(200).json({
      success: true,
      data: {
        status: "HEALTHY",
        version: "1.0.0",
        cloudProvider: "VERCEL_SERVERLESS",
        governanceGates: 6,
        memoryTiers: 8,
        uptimeSeconds: process.uptime(),
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (url.startsWith("/api/v1/dag")) {
    res.status(200).json({
      success: true,
      data: {
        nodes: [
          { id: "task-db-01", code: "TASK-DB-CHARGES", title: "Create Invoices SQL Schema", targetRole: "DATABASE_ENGINEER", status: "VERIFIED", tier: 0 },
          { id: "task-api-01", code: "TASK-API-POST-CHARGES", title: "Implement POST /v1/charges API", targetRole: "BACKEND_SPECIALIST", status: "VERIFIED", tier: 1 },
          { id: "task-ui-01", code: "TASK-UI-CHECKOUT", title: "Build Payment Checkout Screen", targetRole: "FRONTEND_SPECIALIST", status: "VERIFIED", tier: 2 },
          { id: "task-qa-01", code: "TASK-QA-ACCEPTANCE", title: "Run E2E Verification Suite", targetRole: "QA_ENGINEER", status: "VERIFIED", tier: 3 },
        ],
        edges: [
          { from: "task-db-01", to: "task-api-01" },
          { from: "task-api-01", to: "task-ui-01" },
          { from: "task-ui-01", to: "task-qa-01" },
        ],
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (url.startsWith("/api/v1/canary")) {
    res.status(200).json({
      success: true,
      data: {
        currentState: "FULL_PROMOTION",
        trafficPercentage: 100,
        p99LatencyMs: 42,
        errorRate: 0.0001,
        isHealthy: true,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (url.startsWith("/api/v1/mission") && req.method === "POST") {
    res.status(200).json({
      success: true,
      data: {
        missionId: `mission-${Math.floor(1000 + Math.random() * 9000)}`,
        releaseVersion: "v1.0.0-cloud.prod",
        success: true,
        passedGates: [
          "SPECIFICATION_GATE",
          "ARCHITECTURE_GATE",
          "DESIGN_GATE",
          "EXECUTION_GATE",
          "VERIFICATION_GATE",
          "RELEASE_GATE",
        ],
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (url.startsWith("/api/v1/artifacts")) {
    res.status(200).json({
      success: true,
      data: [
        {
          code: "EVID-VERIF-001",
          evidenceType: "UNIT_TEST_OUTPUT",
          verifierSignature: "627d976c1fcaeb01980f7d8c6b7593c66710ae13b28b6d80d2875ab912bb01c3",
          verifiedPassed: true,
        },
        {
          code: "EVID-SEC-001",
          evidenceType: "SECURITY_SCAN_REPORT",
          verifierSignature: "7a7653a7ce79509344a9c3ec789b62974ea958489f795dbd22ae1ced234507e5",
          verifiedPassed: true,
        },
      ],
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (url.startsWith("/api/v1/memory")) {
    res.status(200).json({
      success: true,
      data: [
        {
          category: "FAILURE_MEMORY",
          summary: "Remediated SQL Injection in queries.ts",
          lessonLearned: "Use parameterized query placeholders ($1, $2)",
          preventativeRule: "RULE-PREVENT-SQL_INJECTION: Enforce parameterized queries",
          reinforcementScore: 1.0,
        },
      ],
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(404).json({ success: false, error: "Not Found", timestamp: new Date().toISOString() });
}
