/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Cryptographic Merkle Transparency Ledger (Rekor-compatible)
 */

import crypto from "crypto";
import { TransparencyLogEntry } from "./types.js";

export class TransparencyLedger {
  private entries: TransparencyLogEntry[] = [];

  public appendEntry(params: {
    attestationPayload: string | Record<string, any>;
    signature: string;
    publicKey: string;
  }): TransparencyLogEntry {
    const payloadStr = typeof params.attestationPayload === "string"
      ? params.attestationPayload
      : JSON.stringify(params.attestationPayload);

    const attestationPayloadHash = crypto.createHash("sha256").update(payloadStr).digest("hex");
    const previousEntryHash = this.entries.length > 0
      ? this.entries[this.entries.length - 1].entryHash
      : "0".repeat(64);

    const entryHash = crypto
      .createHash("sha256")
      .update(`${previousEntryHash}:${attestationPayloadHash}:${params.signature}`)
      .digest("hex");

    const entry: TransparencyLogEntry = {
      logIndex: this.entries.length,
      entryHash,
      previousEntryHash,
      attestationPayloadHash,
      signature: params.signature,
      publicKey: params.publicKey,
      timestamp: new Date().toISOString(),
    };

    this.entries.push(entry);
    return entry;
  }

  public getEntries(): readonly TransparencyLogEntry[] {
    return this.entries;
  }

  public verifyLedgerIntegrity(): boolean {
    let prev = "0".repeat(64);
    for (const entry of this.entries) {
      if (entry.previousEntryHash !== prev) return false;
      const expected = crypto
        .createHash("sha256")
        .update(`${prev}:${entry.attestationPayloadHash}:${entry.signature}`)
        .digest("hex");
      if (expected !== entry.entryHash) return false;
      prev = entry.entryHash;
    }
    return true;
  }
}
