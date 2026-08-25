/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Append-Only Cryptographic Event Store & Event Bus
 */

import * as fs from "fs";
import * as path from "path";
import { DomainEvent, EventType, computeEventHash, createDomainEvent } from "../core/events.js";
import { HellxError } from "../core/errors.js";

export type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

export class EventBus {
  private events: DomainEvent<any>[] = [];
  private handlers: Map<EventType | "*", Set<EventHandler<any>>> = new Map();
  private logFilePath?: string;
  private isInitialized: boolean = false;

  constructor(options?: { logFilePath?: string }) {
    if (options?.logFilePath) {
      this.logFilePath = options.logFilePath;
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.logFilePath) {
      const dir = path.dirname(this.logFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.logFilePath)) {
        const content = fs.readFileSync(this.logFilePath, "utf-8");
        const lines = content.split("\n").filter((l) => l.trim().length > 0);
        let previousHash = "0".repeat(64);

        for (let i = 0; i < lines.length; i++) {
          const raw = JSON.parse(lines[i]);
          const expectedHash = computeEventHash(raw);
          if (expectedHash !== raw.currentEventHash) {
            throw new HellxError(
              `Event log tampering detected at sequence #${raw.sequenceNumber}. Hash mismatch: expected ${expectedHash}, got ${raw.currentEventHash}`,
              "EVENT_INTEGRITY_COMPROMISED"
            );
          }
          if (raw.previousEventHash !== previousHash) {
            throw new HellxError(
              `Event chain broken at sequence #${raw.sequenceNumber}. Expected previous hash ${previousHash}, got ${raw.previousEventHash}`,
              "EVENT_CHAIN_BROKEN"
            );
          }
          previousHash = raw.currentEventHash;
          this.events.push(raw);
        }
      }
    }

    this.isInitialized = true;
  }

  public subscribe(type: EventType | "*", handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  public async publish<T = Record<string, any>>(params: {
    id: string;
    type: EventType;
    actorId: string;
    actorRole: string;
    payload: T;
  }): Promise<DomainEvent<T>> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const previousHash =
      this.events.length > 0
        ? this.events[this.events.length - 1].currentEventHash
        : "0".repeat(64);

    const event = createDomainEvent({
      id: params.id,
      sequenceNumber: this.events.length + 1,
      type: params.type,
      actorId: params.actorId,
      actorRole: params.actorRole,
      payload: params.payload,
      previousEventHash: previousHash,
    });

    this.events.push(event);

    if (this.logFilePath) {
      fs.appendFileSync(this.logFilePath, JSON.stringify(event) + "\n", "utf-8");
    }

    // Trigger subscribers
    const specificHandlers = this.handlers.get(params.type);
    if (specificHandlers) {
      for (const h of specificHandlers) {
        try {
          await h(event);
        } catch (err) {
          console.error(`[EventBus] Handler error for ${params.type}:`, err);
        }
      }
    }

    const wildcards = this.handlers.get("*");
    if (wildcards) {
      for (const h of wildcards) {
        try {
          await h(event);
        } catch (err) {
          console.error(`[EventBus] Wildcard handler error:`, err);
        }
      }
    }

    return event;
  }

  public getEvents(): readonly DomainEvent[] {
    return this.events;
  }

  public getEventsByType(type: EventType): DomainEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  public getLatestEvent(): DomainEvent | undefined {
    return this.events[this.events.length - 1];
  }

  public verifyChainIntegrity(): boolean {
    let prev = "0".repeat(64);
    for (const e of this.events) {
      if (e.previousEventHash !== prev) return false;
      const expected = computeEventHash(e);
      if (expected !== e.currentEventHash) return false;
      prev = e.currentEventHash;
    }
    return true;
  }
}
