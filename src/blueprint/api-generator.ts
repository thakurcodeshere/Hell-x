/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * API Contract Generator & OpenAPI 3.1 Schema Engine
 */

import { DomainEntity, APIEndpointContract } from "./types.js";

export class APIGenerator {
  /**
   * Generates REST / OpenAPI contracts for domain entities
   */
  public generateContracts(entities: DomainEntity[]): APIEndpointContract[] {
    const contracts: APIEndpointContract[] = [];

    for (const entity of entities) {
      const basePath = `/v1/${entity.name.toLowerCase()}s`;

      // 1. GET /v1/{entity}s (List)
      contracts.push({
        id: `api-get-list-${entity.name.toLowerCase()}`,
        method: "GET",
        path: basePath,
        summary: `List and filter ${entity.name} records`,
        boundedContext: entity.boundedContext,
        authRequired: true,
        requiredPermissions: [`${entity.name.toLowerCase()}:read`],
        parameters: [
          { name: "page", in: "query", required: false, schema: { type: "integer", default: 1 }, description: "Page number" },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 20 }, description: "Page size limit" },
        ],
        responseSchemas: {
          200: {
            type: "object",
            properties: {
              items: { type: "array", items: { type: "object" } },
              total: { type: "integer" },
              page: { type: "integer" },
            },
          },
          401: { type: "object", properties: { error: { type: "string" } } },
          500: { type: "object", properties: { error: { type: "string" } } },
        },
        rateLimitTps: 100,
        traceRequirementCodes: entity.traceRequirementCodes,
      });

      // 2. GET /v1/{entity}s/{id} (Get by ID)
      contracts.push({
        id: `api-get-item-${entity.name.toLowerCase()}`,
        method: "GET",
        path: `${basePath}/{id}`,
        summary: `Fetch single ${entity.name} by unique ID`,
        boundedContext: entity.boundedContext,
        authRequired: true,
        requiredPermissions: [`${entity.name.toLowerCase()}:read`],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" }, description: "Target ID" },
        ],
        responseSchemas: {
          200: { type: "object", properties: { item: { type: "object" } } },
          404: { type: "object", properties: { error: { type: "string" } } },
        },
        traceRequirementCodes: entity.traceRequirementCodes,
      });

      // 3. POST /v1/{entity}s (Create)
      contracts.push({
        id: `api-post-${entity.name.toLowerCase()}`,
        method: "POST",
        path: basePath,
        summary: `Create new ${entity.name} record`,
        boundedContext: entity.boundedContext,
        authRequired: true,
        requiredPermissions: [`${entity.name.toLowerCase()}:write`],
        parameters: [],
        requestBodySchema: {
          type: "object",
          required: entity.fields.filter((f) => f.required && !f.isPrimary).map((f) => f.name),
          properties: entity.fields.reduce((acc, f) => {
            if (!f.isPrimary) {
              acc[f.name] = { type: f.type.toLowerCase(), description: f.description };
            }
            return acc;
          }, {} as Record<string, any>),
        },
        responseSchemas: {
          201: { type: "object", properties: { item: { type: "object" } } },
          400: { type: "object", properties: { error: { type: "string" } } },
          429: { type: "object", properties: { error: { type: "string" } } },
        },
        rateLimitTps: 20,
        traceRequirementCodes: entity.traceRequirementCodes,
      });
    }

    return contracts;
  }
}
