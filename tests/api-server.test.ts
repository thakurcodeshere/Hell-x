import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MissionControlServer } from "../src/server/api-server.js";
import { EngineeringOS } from "../src/core/engine.js";
import http from "http";

describe("MissionControlServer REST API (Milestone 10)", () => {
  let os: EngineeringOS;
  let server: MissionControlServer;
  let port: number;

  beforeAll(async () => {
    os = new EngineeringOS();
    await os.initialize();
    server = new MissionControlServer(os, { port: 0 }); // Random available port
    port = await server.start(0);
  });

  afterAll(async () => {
    await server.stop();
  });

  function get(path: string): Promise<{ statusCode: number; body: string }> {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:${port}${path}`, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ statusCode: res.statusCode || 0, body: data }));
      }).on("error", (err) => reject(err));
    });
  }

  it("serves HTML dashboard at root /", async () => {
    const res = await get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("<!DOCTYPE html>");
    expect(res.body).toContain("HELL-X");
  });

  it("returns system status at /api/v1/status", async () => {
    const res = await get("/api/v1/status");
    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("HEALTHY");
  });

  it("returns DAG graph DTO at /api/v1/dag", async () => {
    const res = await get("/api/v1/dag");
    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json.success).toBe(true);
    expect(json.data.nodes.length).toBeGreaterThan(0);
    expect(json.data.edges.length).toBeGreaterThan(0);
  });

  it("returns canary telemetry status at /api/v1/canary", async () => {
    const res = await get("/api/v1/canary");
    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json.success).toBe(true);
    expect(json.data.trafficPercentage).toBe(100);
  });
});
