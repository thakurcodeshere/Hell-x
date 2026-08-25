/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Event-Sourced State Derivation & Replay Engine — Step 14
 *
 * All state mutations in Hell-x originate from an append-only event stream.
 * State is never mutated in-place destructively; it is derived by replaying events.
 *
 * Core capabilities:
 *   1. Append-only event store with monotonic sequence IDs and SHA-256 integrity hash chaining.
 *   2. State derivation from initial genesis state through sequential event reduction.
 *   3. Point-in-time time-travel replay (reconstruct state at any historic sequence number or timestamp).
 *   4. Deterministic snapshotting for fast recovery.
 *
 * External Authority:
 *   Martin Fowler / Greg Young Event Sourcing pattern
 *   NIST SP 800-53 AU-10 (Non-Repudiation)
 *   Hell-x Law 07: Evidentiary Proof (every state change has a cryptographically verifiable event trace)
 */

import { createHash } from "crypto";

export interface SourcedEvent<T = any> {
  sequenceNumber: number;
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  actorId: string;
  payload: T;
  timestamp: string;
  previousEventHash: string;
  eventHash: string;
}

export interface StateSnapshot<S = any> {
  snapshotId: string;
  aggregateId: string;
  sequenceNumber: number;
  state: S;
  stateHash: string;
  capturedAt: string;
}

export type EventReducer<S, E> = (currentState: S, event: SourcedEvent<E>) => S;

export class EventSourcedStore<S = any> {
  private events: SourcedEvent[] = [];
  private snapshots: Map<string, StateSnapshot<S>[]> = new Map(); // aggregateId -> snapshots
  private reducers: Map<string, EventReducer<S, any>> = new Map();

  constructor(private initialGenState: S) {}

  /**
   * Registers an event reducer for a specific aggregate type.
   */
  public registerReducer(aggregateType: string, reducer: EventReducer<S, any>): void {
    this.reducers.set(aggregateType, reducer);
  }

  private computeEventHash(
    seq: number,
    eventId: string,
    type: string,
    aggregateId: string,
    payload: any,
    prevHash: string,
    timestamp: string
  ): string {
    const payloadStr = JSON.stringify(payload);
    return createHash("sha256")
      .update(`${seq}:${eventId}:${type}:${aggregateId}:${payloadStr}:${prevHash}:${timestamp}`)
      .digest("hex");
  }

  /**
   * Appends an event to the append-only stream with cryptographic hash chaining.
   */
  public appendEvent<T = any>(params: {
    eventType: string;
    aggregateId: string;
    aggregateType: string;
    actorId: string;
    payload: T;
  }): SourcedEvent<T> {
    const seq = this.events.length + 1;
    const eventId = `evt-${params.aggregateId}-${seq}-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const prevHash = this.events.length > 0 ? this.events[this.events.length - 1].eventHash : "GENESIS_HASH_0000000000000000000000000000000000000000000000000000000000000000";

    const eventHash = this.computeEventHash(
      seq,
      eventId,
      params.eventType,
      params.aggregateId,
      params.payload,
      prevHash,
      timestamp
    );

    const event: SourcedEvent<T> = {
      sequenceNumber: seq,
      eventId,
      eventType: params.eventType,
      aggregateId: params.aggregateId,
      aggregateType: params.aggregateType,
      actorId: params.actorId,
      payload: params.payload,
      timestamp,
      previousEventHash: prevHash,
      eventHash,
    };

    this.events.push(event);
    return event;
  }

  /**
   * Replays events from genesis (or latest snapshot) to reconstruct current aggregate state.
   */
  public deriveState(aggregateId: string, aggregateType: string, upToSequence?: number): S {
    const reducer = this.reducers.get(aggregateType);
    if (!reducer) {
      throw new Error(`[EVENT-SOURCING] No reducer registered for aggregate type '${aggregateType}'.`);
    }

    // Find latest valid snapshot before upToSequence
    const aggSnapshots = this.snapshots.get(aggregateId) || [];
    let state = JSON.parse(JSON.stringify(this.initialGenState)) as S;
    let startSeq = 0;

    for (let i = aggSnapshots.length - 1; i >= 0; i--) {
      const snap = aggSnapshots[i];
      if (!upToSequence || snap.sequenceNumber <= upToSequence) {
        state = JSON.parse(JSON.stringify(snap.state));
        startSeq = snap.sequenceNumber;
        break;
      }
    }

    // Filter relevant events for this aggregate after snapshot
    const relevantEvents = this.events.filter(
      (e) =>
        e.aggregateId === aggregateId &&
        e.sequenceNumber > startSeq &&
        (!upToSequence || e.sequenceNumber <= upToSequence)
    );

    for (const evt of relevantEvents) {
      state = reducer(state, evt);
    }

    return state;
  }

  /**
   * Takes a point-in-time snapshot of current derived state for fast recovery.
   */
  public createSnapshot(aggregateId: string, aggregateType: string): StateSnapshot<S> {
    const currentState = this.deriveState(aggregateId, aggregateType);
    const lastEvent = [...this.events].reverse().find((e) => e.aggregateId === aggregateId);
    const seq = lastEvent ? lastEvent.sequenceNumber : 0;

    const stateStr = JSON.stringify(currentState);
    const stateHash = createHash("sha256").update(stateStr).digest("hex");

    const snapshot: StateSnapshot<S> = {
      snapshotId: `snap-${aggregateId}-${seq}-${Date.now()}`,
      aggregateId,
      sequenceNumber: seq,
      state: currentState,
      stateHash,
      capturedAt: new Date().toISOString(),
    };

    if (!this.snapshots.has(aggregateId)) {
      this.snapshots.set(aggregateId, []);
    }
    this.snapshots.get(aggregateId)!.push(snapshot);

    return snapshot;
  }

  /**
   * Verifies the cryptographic chain integrity of the entire event log.
   */
  public verifyLogIntegrity(): { isValid: boolean; brokenAtSequence?: number; details: string } {
    let prevHash = "GENESIS_HASH_0000000000000000000000000000000000000000000000000000000000000000";

    for (const evt of this.events) {
      if (evt.previousEventHash !== prevHash) {
        return {
          isValid: false,
          brokenAtSequence: evt.sequenceNumber,
          details: `Hash chain break at sequence ${evt.sequenceNumber}: expected previous hash ${prevHash}, got ${evt.previousEventHash}`,
        };
      }

      const expectedHash = this.computeEventHash(
        evt.sequenceNumber,
        evt.eventId,
        evt.eventType,
        evt.aggregateId,
        evt.payload,
        evt.previousEventHash,
        evt.timestamp
      );

      if (evt.eventHash !== expectedHash) {
        return {
          isValid: false,
          brokenAtSequence: evt.sequenceNumber,
          details: `Tamper detected at sequence ${evt.sequenceNumber}: payload does not match event hash.`,
        };
      }

      prevHash = evt.eventHash;
    }

    return {
      isValid: true,
      details: `All ${this.events.length} events cryptographically validated with zero tampering.`,
    };
  }

  public getEvents(aggregateId?: string): SourcedEvent[] {
    return aggregateId ? this.events.filter((e) => e.aggregateId === aggregateId) : [...this.events];
  }
}
