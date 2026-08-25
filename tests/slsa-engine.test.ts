import { describe, it, expect } from "vitest";
import { SLSAEngine } from "../src/attestation/slsa-engine.js";
import { AttestationSigner } from "../src/attestation/attestation-signer.js";
import { TransparencyLedger } from "../src/attestation/transparency-ledger.js";

describe("SLSA Provenance Engine & Transparency Ledger (Milestone 11)", () => {
  const signer = new AttestationSigner();
  const slsa = new SLSAEngine(signer);
  const ledger = new TransparencyLedger();

  it("synthesizes signed SLSA Level 3 Provenance statement", () => {
    const res = slsa.generateSLSAProvenance({
      artifactName: "hellx-engine-v1.0.0.tar.gz",
      artifactContentOrHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      sourceRepoUri: "https://github.com/hell-x/engineering-os",
      gitCommitHash: "c0fa2f2b380a1",
      builderAgentId: "agent-release-manager-01",
      invocationParameters: { targetTier: "CANARY_100" },
    });

    expect(res.statement._type).toBe("https://in-toto.io/Statement/v1");
    expect(res.statement.predicateType).toBe("https://slsa.dev/provenance/v1");
    expect(res.statement.subject[0].name).toBe("hellx-engine-v1.0.0.tar.gz");
    expect(res.statement.predicate.buildDefinition.buildType).toContain("builder/v1");
    expect(res.signature).toBeDefined();

    // Verify signature
    const verified = signer.verifySignature(res.statement, res.signature);
    expect(verified).toBe(true);

    // Append to transparency ledger
    const entry = ledger.appendEntry({
      attestationPayload: res.statement,
      signature: res.signature,
      publicKey: signer.getPublicKey(),
    });

    expect(entry.logIndex).toBe(0);
    expect(entry.entryHash.length).toBe(64);
    expect(ledger.verifyLedgerIntegrity()).toBe(true);
  });
});
