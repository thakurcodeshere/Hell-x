/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Immutable Domain Events & Cryptographic Event Chaining
 */

import { z } from "zod";
import * as crypto from "crypto";

export const EventTypeSchema = z.enum([
  "PROJECT_INITIALIZED",
  "INTENT_RECEIVED",
  "REQUIREMENT_CREATED",
  "REQUIREMENT_VALIDATED",
  "REQUIREMENT_CONFLICT_DETECTED",
  "ADR_PROPOSED",
  "ADR_ACCEPTED",
  "TASK_SCHEDULED",
  "TASK_ASSIGNED",
  "TASK_STARTED",
  "WORKTREE_CREATED",
  "WORKTREE_DIFF_CAPTURED",
  "EVIDENCE_RECORDED",
  "EVIDENCE_SUBMITTED",
  "EVIDENCE_VERIFIED",
  "EVIDENCE_REJECTED",
  "GATE_EVALUATION_REQUESTED",
  "GATE_PASSED",
  "GATE_BLOCKED",
  "ROLLBACK_TRIGGERED",
  "MEMORY_REINFORCED",
  "POLICY_VIOLATION_DETECTED",
]);

export type EventType = z.infer<typeof EventTypeSchema>;

export interface DomainEvent<T = Record<string, any>> {
  id: string;
  sequenceNumber: number;
  type: EventType;
  timestamp: string;
  actorId: string;
  actorRole: string;
  payload: T;
  previousEventHash: string;
  currentEventHash: string;
}

export function computeEventHash<T = any>(event: Omit<DomainEvent<T>, "currentEventHash">): string {
  const serialized = JSON.stringify({
    id: event.id,
    sequenceNumber: event.sequenceNumber,
    type: event.type,
    timestamp: event.timestamp,
    actorId: event.actorId,
    actorRole: event.actorRole,
    payload: event.payload,
    previousEventHash: event.previousEventHash,
  });
  return crypto.createHash("sha256").update(serialized).digest("hex");
}

export function createDomainEvent<T = any>(params: {
  id: string;
  sequenceNumber: number;
  type: EventType;
  actorId: string;
  actorRole: string;
  payload: T;
  previousEventHash: string;
  timestamp?: string;
}): DomainEvent<T> {
  const timestamp = params.timestamp || new Date().toISOString();
  const partial = {
    id: params.id,
    sequenceNumber: params.sequenceNumber,
    type: params.type,
    timestamp,
    actorId: params.actorId,
    actorRole: params.actorRole,
    payload: params.payload,
    previousEventHash: params.previousEventHash,
  };
  const currentEventHash = computeEventHash(partial);
  return {
    ...partial,
    currentEventHash,
  };
}
