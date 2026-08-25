/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Cryptographic Attestation & Hardware Proof Signer
 */

import crypto from "crypto";
import { SigningKeypair } from "./types.js";
import { EvidenceArtifact } from "../core/artifacts.js";

export class AttestationSigner {
  private keypair: SigningKeypair;

  constructor(existingKeypair?: SigningKeypair) {
    if (existingKeypair) {
      this.keypair = existingKeypair;
    } else {
      const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      });
      this.keypair = {
        publicKey,
        privateKey,
        keyId: `key-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        algorithm: "RSA-SHA256",
      };
    }
  }

  public getKeyId(): string {
    return this.keypair.keyId;
  }

  public getPublicKey(): string {
    return this.keypair.publicKey;
  }

  public signPayload(payload: string | Record<string, any>): string {
    const dataStr = typeof payload === "string" ? payload : JSON.stringify(payload);
    const sign = crypto.createSign("SHA256");
    sign.update(dataStr);
    sign.end();
    return sign.sign(this.keypair.privateKey, "hex");
  }

  public verifySignature(
    payload: string | Record<string, any>,
    signatureHex: string,
    publicKeyPem?: string
  ): boolean {
    try {
      const dataStr = typeof payload === "string" ? payload : JSON.stringify(payload);
      const verify = crypto.createVerify("SHA256");
      verify.update(dataStr);
      verify.end();
      return verify.verify(publicKeyPem || this.keypair.publicKey, signatureHex, "hex");
    } catch {
      return false;
    }
  }

  public attestEvidence(evidence: EvidenceArtifact): {
    signature: string;
    keyId: string;
    publicKey: string;
    sha256Digest: string;
  } {
    const canonicalPayload = JSON.stringify({
      code: evidence.code,
      evidenceType: evidence.evidenceType,
      targetRequirementCode: evidence.targetRequirementCode,
      rawPayload: evidence.rawPayload,
      verifierAgentId: evidence.verifierAgentId,
      verifiedPassed: evidence.verifiedPassed,
    });

    const sha256Digest = crypto.createHash("sha256").update(canonicalPayload).digest("hex");
    const signature = this.signPayload(canonicalPayload);

    return {
      signature,
      keyId: this.keypair.keyId,
      publicKey: this.keypair.publicKey,
      sha256Digest,
    };
  }
}
