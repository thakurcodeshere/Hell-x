/**
 * Hell-x Tests: Event-Sourced State Derivation & Replay (Step 14)
 */
import { describe, it, expect } from "vitest";
import { EventSourcedStore } from "../src/storage/event-sourcing.js";

interface TaskState {
  id: string;
  status: "PENDING" | "IN_PROGRESS" | "VERIFIED" | "DEPLOYED";
  assignee?: string;
  testPassCount: number;
}

describe("EventSourcedStore — Event Sourcing & Time-Travel Replay (Step 14)", () => {
  const initial: TaskState = {
    id: "task-100",
    status: "PENDING",
    testPassCount: 0,
  };

  it("appends events with SHA-256 hash chaining and verifies log integrity", () => {
    const store = new EventSourcedStore<TaskState>(initial);
    store.registerReducer("TASK", (state, evt) => {
      if (evt.eventType === "TASK_STARTED") {
        return { ...state, status: "IN_PROGRESS", assignee: evt.payload.assignee };
      }
      if (evt.eventType === "TESTS_PASSED") {
        return { ...state, testPassCount: state.testPassCount + evt.payload.count };
      }
      if (evt.eventType === "TASK_VERIFIED") {
        return { ...state, status: "VERIFIED" };
      }
      return state;
    });

    store.appendEvent({
      eventType: "TASK_STARTED",
      aggregateId: "task-100",
      aggregateType: "TASK",
      actorId: "agent-backend",
      payload: { assignee: "agent-backend" },
    });

    store.appendEvent({
      eventType: "TESTS_PASSED",
      aggregateId: "task-100",
      aggregateType: "TASK",
      actorId: "agent-qa",
      payload: { count: 12 },
    });

    store.appendEvent({
      eventType: "TASK_VERIFIED",
      aggregateId: "task-100",
      aggregateType: "TASK",
      actorId: "agent-verifier",
      payload: { signature: "sig-001" },
    });

    // Check derived final state
    const derived = store.deriveState("task-100", "TASK");
    expect(derived.status).toBe("VERIFIED");
    expect(derived.assignee).toBe("agent-backend");
    expect(derived.testPassCount).toBe(12);

    // Verify cryptographic hash chaining integrity
    const integrity = store.verifyLogIntegrity();
    expect(integrity.isValid).toBe(true);
    expect(integrity.details).toContain("3 events cryptographically validated");
  });

  it("supports point-in-time time-travel state reconstruction", () => {
    const store = new EventSourcedStore<TaskState>(initial);
    store.registerReducer("TASK", (state, evt) => {
      if (evt.eventType === "TASK_STARTED") return { ...state, status: "IN_PROGRESS" };
      if (evt.eventType === "TASK_VERIFIED") return { ...state, status: "VERIFIED" };
      return state;
    });

    store.appendEvent({ eventType: "TASK_STARTED", aggregateId: "task-100", aggregateType: "TASK", actorId: "a1", payload: {} });
    store.appendEvent({ eventType: "TASK_VERIFIED", aggregateId: "task-100", aggregateType: "TASK", actorId: "a2", payload: {} });

    // Time-travel to sequence 1 (should be IN_PROGRESS, not yet VERIFIED)
    const atSeq1 = store.deriveState("task-100", "TASK", 1);
    expect(atSeq1.status).toBe("IN_PROGRESS");

    // Full state at sequence 2
    const atSeq2 = store.deriveState("task-100", "TASK", 2);
    expect(atSeq2.status).toBe("VERIFIED");
  });

  it("creates and recovers from state snapshots", () => {
    const store = new EventSourcedStore<TaskState>(initial);
    store.registerReducer("TASK", (state, evt) => {
      if (evt.eventType === "ADD_TESTS") {
        return { ...state, testPassCount: state.testPassCount + evt.payload.count };
      }
      return state;
    });

    store.appendEvent({ eventType: "ADD_TESTS", aggregateId: "task-100", aggregateType: "TASK", actorId: "a1", payload: { count: 50 } });

    // Snapshot at 50 tests
    const snap = store.createSnapshot("task-100", "TASK");
    expect(snap.state.testPassCount).toBe(50);

    // Add 25 more
    store.appendEvent({ eventType: "ADD_TESTS", aggregateId: "task-100", aggregateType: "TASK", actorId: "a1", payload: { count: 25 } });

    // Derived state should be 75 (using snapshot + 1 event)
    const finalState = store.deriveState("task-100", "TASK");
    expect(finalState.testPassCount).toBe(75);
  });
});
