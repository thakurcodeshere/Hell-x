/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 2: Blueprint & Architecture Engine Types
 */

import { ADRArtifact, RequirementArtifact } from "../core/artifacts.js";

export interface DomainField {
  name: string;
  type: "STRING" | "NUMBER" | "BOOLEAN" | "DATETIME" | "JSON" | "UUID" | "ARRAY";
  required: boolean;
  isPrimary?: boolean;
  isUnique?: boolean;
  description: string;
}

export interface DomainEntity {
  id: string;
  name: string;
  boundedContext: string;
  description: string;
  fields: DomainField[];
  invariants: string[];
  relationships: {
    targetEntity: string;
    cardinality: "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_ONE" | "MANY_TO_MANY";
    foreignKeyField: string;
  }[];
  traceRequirementCodes: string[];
}

export interface APIParameter {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  required: boolean;
  schema: Record<string, any>;
  description: string;
}

export interface APIEndpointContract {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  boundedContext: string;
  authRequired: boolean;
  requiredPermissions: string[];
  parameters: APIParameter[];
  requestBodySchema?: Record<string, any>;
  responseSchemas: Record<number, Record<string, any>>; // e.g. 200: { type: "object", ... }
  rateLimitTps?: number;
  traceRequirementCodes: string[];
}

export interface DatabaseIndex {
  name: string;
  columns: string[];
  unique: boolean;
}

export interface DatabaseTableSchema {
  id: string;
  tableName: string;
  columns: {
    name: string;
    sqlType: string;
    nullable: boolean;
    primaryKey: boolean;
    defaultValue?: string;
    references?: { table: string; column: string };
  }[];
  indexes: DatabaseIndex[];
  ddlCreateStatement: string;
  traceRequirementCodes: string[];
}

export interface SecurityBoundaryModel {
  id: string;
  authenticationMechanism: "JWT_BEARER" | "OAUTH2_PKCE" | "SESSION_COOKIE" | "API_KEY";
  tokenTtlSeconds: number;
  rbacRoles: {
    roleName: string;
    allowedPermissions: string[];
    deniedPermissions: string[];
  }[];
  secretIsolationPolicies: string[];
  traceRequirementCodes: string[];
}

export interface ArchitectureBlueprint {
  id: string;
  projectId: string;
  version: number;
  boundedContexts: string[];
  entities: DomainEntity[];
  adrs: ADRArtifact[];
  apiContracts: APIEndpointContract[];
  databaseSchemas: DatabaseTableSchema[];
  securityModel: SecurityBoundaryModel;
  traceRequirementCodes: string[];
  createdAt: string;
  updatedAt: string;
}
