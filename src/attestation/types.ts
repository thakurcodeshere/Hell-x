/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Cryptographic Attestation & SLSA Supply Chain Types
 */

export interface SigningKeypair {
  publicKey: string;
  privateKey: string;
  keyId: string;
  algorithm: "RSA-SHA256" | "ECDSA-P256";
}

export interface AttestationStatement {
  _type: "https://in-toto.io/Statement/v1";
  subject: {
    name: string;
    digest: {
      sha256: string;
    };
  }[];
  predicateType: "https://slsa.dev/provenance/v1";
  predicate: SLSAProvenancePredicate;
}

export interface SLSAProvenancePredicate {
  buildDefinition: {
    buildType: string;
    externalParameters: Record<string, any>;
    internalParameters?: Record<string, any>;
    resolvedDependencies: {
      uri: string;
      digest: { sha256: string };
    }[];
  };
  runDetails: {
    builder: {
      id: string;
      version?: string;
    };
    metadata: {
      invocationId: string;
      startedOn: string;
      finishedOn: string;
    };
    byproducts?: {
      name: string;
      digest: { sha256: string };
    }[];
  };
}

export interface TransparencyLogEntry {
  logIndex: number;
  entryHash: string;
  previousEntryHash: string;
  attestationPayloadHash: string;
  signature: string;
  publicKey: string;
  timestamp: string;
}
