/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Digital Twin System Types (Section 27)
 */

export interface SystemNodeModel {
  id: string;
  name: string;
  type: "SERVICE" | "DATABASE" | "CACHE" | "MESSAGE_QUEUE" | "GATEWAY";
  version: string;
  endpoints: {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    p99LatencyMs: number;
    requiresAuth: boolean;
  }[];
  dependencies: string[]; // target Node IDs
  stateInvariants: string[];
}

export interface ServiceContractModel {
  serviceId: string;
  endpointPath: string;
  requestSchema: Record<string, any>;
  responseSchema: Record<string, any>;
  idempotencyEnforced: boolean;
}

export interface DataStoreModel {
  id: string;
  engine: "POSTGRESQL" | "REDIS" | "CLICKHOUSE" | "DYNAMODB";
  tables: {
    name: string;
    columns: string[];
    indexes: string[];
    foreignKeys: { column: string; referencesTable: string; referencesColumn: string }[];
  }[];
}

export interface DigitalTwinState {
  version: number;
  timestamp: string;
  nodes: SystemNodeModel[];
  contracts: ServiceContractModel[];
  dataStores: DataStoreModel[];
  activeTrafficRps: number;
  overallHealthScore: number;
}

export interface TwinSimulationDelta {
  proposedChangeId: string;
  affectedNodeIds: string[];
  contractBreakingChanges: {
    endpoint: string;
    reason: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM";
  }[];
  predictedLatencyDeltaMs: number;
  simulatedHealthScore: number;
  isSafeToApply: boolean;
}
