/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Domain Modeler & Entity Synthesis Engine
 */

import { RequirementArtifact } from "../core/artifacts.js";
import { DomainEntity, DomainField } from "./types.js";

export class DomainModeler {
  /**
   * Derives rich domain entities and aggregates directly from requirements
   */
  public modelDomain(requirements: RequirementArtifact[]): {
    boundedContexts: string[];
    entities: DomainEntity[];
  } {
    const contextSet = new Set<string>();
    const entities: DomainEntity[] = [];

    for (const req of requirements) {
      const tag = req.tags[0] || "core";
      const contextName = tag.toUpperCase();
      contextSet.add(contextName);

      // Check requirement domain keyword
      const lower = `${req.title} ${req.objective} ${req.workflow.join(" ")}`.toLowerCase();

      if (lower.includes("payment") || lower.includes("billing") || lower.includes("charge")) {
        entities.push({
          id: `entity-payment-${Date.now()}-${entities.length + 1}`,
          name: "PaymentTransaction",
          boundedContext: "PAYMENT",
          description: "Represents a financial transaction, charge, or refund event.",
          fields: [
            { name: "id", type: "UUID", required: true, isPrimary: true, description: "Unique transaction ID" },
            { name: "accountId", type: "UUID", required: true, description: "Tenant or user account ID" },
            { name: "amountCents", type: "NUMBER", required: true, description: "Amount in smallest currency unit" },
            { name: "currency", type: "STRING", required: true, description: "ISO-4217 3-letter currency code" },
            { name: "status", type: "STRING", required: true, description: "PENDING, SUCCEEDED, FAILED, REFUNDED" },
            { name: "idempotencyKey", type: "STRING", required: true, isUnique: true, description: "Key to prevent duplicate charges" },
            { name: "createdAt", type: "DATETIME", required: true, description: "Timestamp of creation" },
          ],
          invariants: [
            "Amount must be strictly greater than 0.",
            "Successful transactions cannot be mutated or deleted.",
          ],
          relationships: [
            { targetEntity: "Invoice", cardinality: "ONE_TO_ONE", foreignKeyField: "invoiceId" },
          ],
          traceRequirementCodes: [req.code],
        });

        entities.push({
          id: `entity-invoice-${Date.now()}-${entities.length + 1}`,
          name: "Invoice",
          boundedContext: "PAYMENT",
          description: "Immutable tax invoice record for compliance and auditing.",
          fields: [
            { name: "id", type: "UUID", required: true, isPrimary: true, description: "Unique invoice ID" },
            { name: "transactionId", type: "UUID", required: true, description: "Linked transaction ID" },
            { name: "invoiceNumber", type: "STRING", required: true, isUnique: true, description: "Formatted tax invoice sequence" },
            { name: "taxAmountCents", type: "NUMBER", required: true, description: "Tax portion" },
            { name: "auditLedgerHash", type: "STRING", required: true, description: "SHA-256 tamper-evident seal" },
            { name: "issuedAt", type: "DATETIME", required: true, description: "Timestamp of issue" },
          ],
          invariants: [
            "Invoices must be permanently retained for at least 7-10 years.",
            "Invoice numbers must be sequential and contiguous.",
          ],
          relationships: [],
          traceRequirementCodes: [req.code],
        });
      }

      if (lower.includes("auth") || lower.includes("user") || lower.includes("account") || lower.includes("jwt")) {
        entities.push({
          id: `entity-user-${Date.now()}-${entities.length + 1}`,
          name: "UserAccount",
          boundedContext: "IDENTITY",
          description: "Principal user entity with authentication credentials and role assignments.",
          fields: [
            { name: "id", type: "UUID", required: true, isPrimary: true, description: "Unique User ID" },
            { name: "email", type: "STRING", required: true, isUnique: true, description: "Unique email address" },
            { name: "passwordHash", type: "STRING", required: true, description: "Argon2id password hash" },
            { name: "isMfaEnabled", type: "BOOLEAN", required: true, description: "MFA enforcement flag" },
            { name: "isDeleted", type: "BOOLEAN", required: true, description: "Soft-delete flag for GDPR compliance" },
            { name: "createdAt", type: "DATETIME", required: true, description: "Registration timestamp" },
          ],
          invariants: [
            "Soft-deleted users have PII anonymized but foreign keys to financial ledger preserved.",
          ],
          relationships: [
            { targetEntity: "UserSession", cardinality: "ONE_TO_MANY", foreignKeyField: "userId" },
          ],
          traceRequirementCodes: [req.code],
        });
      }
    }

    // Deduplicate entities by name
    const uniqueEntitiesMap = new Map<string, DomainEntity>();
    for (const e of entities) {
      if (uniqueEntitiesMap.has(e.name)) {
        const existing = uniqueEntitiesMap.get(e.name)!;
        existing.traceRequirementCodes = Array.from(
          new Set([...existing.traceRequirementCodes, ...e.traceRequirementCodes])
        );
      } else {
        uniqueEntitiesMap.set(e.name, e);
      }
    }

    return {
      boundedContexts: Array.from(contextSet),
      entities: Array.from(uniqueEntitiesMap.values()),
    };
  }
}
