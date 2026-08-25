/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * The Engineering Digital Twin Engine (Section 27)
 * In-memory simulation replica of live architecture, contracts, data stores and failure domains.
 */

import { DigitalTwinState, SystemNodeModel, ServiceContractModel, DataStoreModel, TwinSimulationDelta } from "./types.js";
import { EventBus } from "../storage/event-bus.js";

export class DigitalTwinEngine {
  private state: DigitalTwinState;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.state = {
      version: 1,
      timestamp: new Date().toISOString(),
      nodes: [
        {
          id: "node-gateway",
          name: "API Edge Gateway",
          type: "GATEWAY",
          version: "v1.0.0",
          endpoints: [
            { path: "/v1/charges", method: "POST", p99LatencyMs: 42, requiresAuth: true },
            { path: "/v1/invoices/:id", method: "GET", p99LatencyMs: 25, requiresAuth: true },
          ],
          dependencies: ["node-billing-svc"],
          stateInvariants: ["RateLimit <= 2000 RPS", "HMAC verification on all webhooks"],
        },
        {
          id: "node-billing-svc",
          name: "Billing & Invoicing Microservice",
          type: "SERVICE",
          version: "v1.0.0",
          endpoints: [
            { path: "/internal/invoices", method: "POST", p99LatencyMs: 35, requiresAuth: true },
          ],
          dependencies: ["node-db-pg", "node-cache-redis"],
          stateInvariants: ["amountCents > 0", "idempotency_key uniqueness"],
        },
        {
          id: "node-db-pg",
          name: "Primary PostgreSQL Cluster",
          type: "DATABASE",
          version: "16.1",
          endpoints: [],
          dependencies: [],
          stateInvariants: ["Active connections <= 200", "Replication lag < 100ms"],
        },
        {
          id: "node-cache-redis",
          name: "Redis State & Rate Limiting Cluster",
          type: "CACHE",
          version: "7.2",
          endpoints: [],
          dependencies: [],
          stateInvariants: ["Memory usage < 75%", "Hit ratio >= 85%"],
        },
      ],
      contracts: [
        {
          serviceId: "node-billing-svc",
          endpointPath: "/v1/charges",
          requestSchema: { tenantId: "string", amountCents: "number", currency: "string" },
          responseSchema: { invoiceId: "string", status: "string" },
          idempotencyEnforced: true,
        },
      ],
      dataStores: [
        {
          id: "node-db-pg",
          engine: "POSTGRESQL",
          tables: [
            {
              name: "invoices",
              columns: ["id", "tenant_id", "amount_cents", "currency", "status", "created_at"],
              indexes: ["idx_invoices_tenant", "idx_invoices_created"],
              foreignKeys: [],
            },
          ],
        },
      ],
      activeTrafficRps: 1450,
      overallHealthScore: 0.98,
    };
  }

  public getState(): DigitalTwinState {
    return { ...this.state };
  }

  public registerNode(node: SystemNodeModel): void {
    const existingIdx = this.state.nodes.findIndex((n) => n.id === node.id);
    if (existingIdx >= 0) {
      this.state.nodes[existingIdx] = node;
    } else {
      this.state.nodes.push(node);
    }
    this.state.version += 1;
    this.state.timestamp = new Date().toISOString();
  }

  /**
   * Simulates applying a proposed architectural or schema change to the digital twin
   */
  public simulateChange(proposal: {
    id: string;
    targetNodeId: string;
    proposedSchemaChanges?: { table: string; droppedColumns: string[]; addedColumns: string[] };
    proposedEndpointChanges?: { path: string; modifiedParams: string[] };
    addedLatencyMs?: number;
  }): TwinSimulationDelta {
    const affectedNodeIds: string[] = [proposal.targetNodeId];
    const contractBreakingChanges: { endpoint: string; reason: string; severity: "CRITICAL" | "HIGH" | "MEDIUM" }[] = [];

    // Find downstream dependents in twin
    for (const node of this.state.nodes) {
      if (node.dependencies.includes(proposal.targetNodeId) && !affectedNodeIds.includes(node.id)) {
        affectedNodeIds.push(node.id);
      }
    }

    // Check schema breaking changes
    if (proposal.proposedSchemaChanges?.droppedColumns.length) {
      for (const col of proposal.proposedSchemaChanges.droppedColumns) {
        if (col === "tenant_id" || col === "id") {
          contractBreakingChanges.push({
            endpoint: "/v1/charges",
            reason: `Dropped critical column '${col}' breaks multi-tenant isolation invariant in Billing Service.`,
            severity: "CRITICAL",
          });
        }
      }
    }

    // Check endpoint breaking changes
    if (proposal.proposedEndpointChanges?.modifiedParams.length) {
      for (const param of proposal.proposedEndpointChanges.modifiedParams) {
        contractBreakingChanges.push({
          endpoint: proposal.proposedEndpointChanges.path,
          reason: `Modified parameter '${param}' breaks downstream API client contract.`,
          severity: "HIGH",
        });
      }
    }

    const predictedLatencyDeltaMs = proposal.addedLatencyMs || 0;
    const isSafeToApply = contractBreakingChanges.filter((c) => c.severity === "CRITICAL").length === 0;
    const simulatedHealthScore = isSafeToApply ? 0.96 : 0.45;

    return {
      proposedChangeId: proposal.id,
      affectedNodeIds,
      contractBreakingChanges,
      predictedLatencyDeltaMs,
      simulatedHealthScore,
      isSafeToApply,
    };
  }
}
