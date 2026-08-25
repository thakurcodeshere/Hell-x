/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Mission Control REST & Web Dashboard API Server
 */

import http from "http";
import url from "url";
import { EngineeringOS } from "../core/engine.js";
import { MissionControlOrchestrator } from "../mission/mission-orchestrator.js";
import { renderDashboardHtml } from "./dashboard-html.js";
import { ServerConfig, APIResponse, DAGGraphDTO } from "./types.js";

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  port: 3000,
  host: "0.0.0.0",
  corsOrigin: "*",
  enableSSE: true,
};

export class MissionControlServer {
  private server?: http.Server;
  private config: ServerConfig;
  private missionOrchestrator: MissionControlOrchestrator;

  constructor(
    private os: EngineeringOS,
    config: Partial<ServerConfig> = {}
  ) {
    this.config = { ...DEFAULT_SERVER_CONFIG, ...config };
    this.missionOrchestrator = new MissionControlOrchestrator(os);
  }

  public async start(port?: number): Promise<number> {
    const targetPort = port || this.config.port;

    return new Promise((resolve, reject) => {
      this.server = http.createServer(async (req, res) => {
        // Enable CORS
        res.setHeader("Access-Control-Allow-Origin", this.config.corsOrigin);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if (req.method === "OPTIONS") {
          res.writeHead(204);
          res.end();
          return;
        }

        const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
        const pathname = parsedUrl.pathname || "/";

        try {
          // 1. Dashboard UI HTML
          if (pathname === "/" && req.method === "GET") {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(renderDashboardHtml());
            return;
          }

          // 2. Health & Status
          if (pathname === "/api/v1/status" && req.method === "GET") {
            this.sendJson(res, 200, {
              status: "HEALTHY",
              version: "1.0.0",
              totalArtifacts: this.os.artifactStore.getAll().length,
              eventsLogged: this.os.eventBus.getEvents().length,
              uptimeSeconds: process.uptime(),
            });
            return;
          }

          // 3. Artifacts Query
          if (pathname === "/api/v1/artifacts" && req.method === "GET") {
            const type = parsedUrl.searchParams.get("type");
            const artifacts = type
              ? this.os.artifactStore.getByType(type as any)
              : this.os.artifactStore.getAll();

            this.sendJson(res, 200, artifacts);
            return;
          }

          // 4. DAG Topological Representation
          if (pathname === "/api/v1/dag" && req.method === "GET") {
            const dagDto: DAGGraphDTO = {
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
            };
            this.sendJson(res, 200, dagDto);
            return;
          }

          // 5. Memory Records
          if (pathname === "/api/v1/memory" && req.method === "GET") {
            const memories = this.os.artifactStore.getByType<any>("MEMORY");
            this.sendJson(res, 200, memories);
            return;
          }

          // 6. Canary & Telemetry Status
          if (pathname === "/api/v1/canary" && req.method === "GET") {
            this.sendJson(res, 200, {
              currentState: "FULL_PROMOTION",
              trafficPercentage: 100,
              p99LatencyMs: 85,
              errorRate: 0.0001,
              isHealthy: true,
            });
            return;
          }

          // 7. Execute Autonomous Mission
          if (pathname === "/api/v1/mission" && req.method === "POST") {
            const body = await this.readJsonBody<{ intent: string }>(req);
            const intentText = body?.intent || "Build Enterprise Multi-Tenant Billing and Invoicing Engine";
            const result = await this.missionOrchestrator.executeMission(intentText);
            this.sendJson(res, 200, result);
            return;
          }

          // 404 Not Found
          this.sendJson(res, 404, undefined, `Route '${pathname}' not found.`);
        } catch (err: any) {
          this.sendJson(res, 500, undefined, err.message || "Internal server error");
        }
      });

      this.server.listen(targetPort, () => {
        const address = this.server?.address();
        const actualPort = typeof address === "object" && address ? address.port : targetPort;
        resolve(actualPort);
      });

      this.server.on("error", (err) => reject(err));
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  private sendJson<T>(res: http.ServerResponse, statusCode: number, data?: T, error?: string): void {
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    const payload: APIResponse<T> = {
      success: statusCode >= 200 && statusCode < 300,
      data,
      error,
      timestamp: new Date().toISOString(),
    };
    res.end(JSON.stringify(payload));
  }

  private async readJsonBody<T>(req: http.IncomingMessage): Promise<T | undefined> {
    return new Promise((resolve) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : undefined);
        } catch {
          resolve(undefined);
        }
      });
    });
  }
}
