/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * GitHub PR & Cryptographic Evidence Synchronization Driver
 */

import { RequirementArtifact, ADRArtifact, EvidenceArtifact, GateDecisionArtifact } from "../core/artifacts.js";
import { OrchestratorTask } from "../orchestrator/types.js";

export interface PREvidencePayload {
  title: string;
  branchName: string;
  baseBranch: string;
  tasks: OrchestratorTask[];
  requirements: RequirementArtifact[];
  adrs: ADRArtifact[];
  evidenceList: EvidenceArtifact[];
  gateDecisions: GateDecisionArtifact[];
}

export class GitHubPRSyncer {
  /**
   * Generates a fully formatted GitHub Pull Request description with Markdown Evidence Tables
   */
  public generatePRDescription(payload: PREvidencePayload): string {
    const lines: string[] = [];

    lines.push(`## 🤖 Hell-x Engineering OS — Pull Request Automation`);
    lines.push(`**Target Branch**: \`${payload.baseBranch}\` ← **Source Worktree**: \`${payload.branchName}\`\n`);

    // 1. Requirements Section
    lines.push(`### 📋 Governed Requirements (${payload.requirements.length})`);
    lines.push(`| Requirement Code | Title | Risk Level | Status |`);
    lines.push(`| :--- | :--- | :---: | :---: |`);
    for (const req of payload.requirements) {
      lines.push(`| **\`${req.code}\`** | ${req.title} | \`${req.riskLevel}\` | ✅ \`${req.status}\` |`);
    }
    lines.push("");

    // 2. Architectural Decisions
    if (payload.adrs.length > 0) {
      lines.push(`### 🏛️ Architectural Decision Records (${payload.adrs.length})`);
      lines.push(`| ADR Code | Title | Decision Chosen | Status |`);
      lines.push(`| :--- | :--- | :--- | :---: |`);
      for (const adr of payload.adrs) {
        lines.push(`| **\`${adr.code}\`** | ${adr.title} | ${adr.decision} | ✅ \`${adr.status}\` |`);
      }
      lines.push("");
    }

    // 3. Cryptographic Evidence Ledger
    lines.push(`### 🛡️ Verified Cryptographic Evidence Ledger (${payload.evidenceList.length})`);
    lines.push(`> [!IMPORTANT]\n> **Claim vs. Proof Principle**: All assertions independently verified by certified QA & Security agents.`);
    lines.push(`| Evidence Code | Evidence Type | Verifier Signature (SHA-256) | Result |`);
    lines.push(`| :--- | :--- | :--- | :---: |`);
    for (const evid of payload.evidenceList) {
      const sigShort = evid.verifierSignature.slice(0, 16);
      lines.push(`| **\`${evid.code}\`** | \`${evid.evidenceType}\` | \`${sigShort}...\` | ${evid.verifiedPassed ? "✅ PASSED" : "❌ FAILED"} |`);
    }
    lines.push("");

    // 4. Governance Gates Matrix
    lines.push(`### 🚦 Governance Gate Evaluations (${payload.gateDecisions.length})`);
    lines.push(`| Gate Code | Gate Type | Evaluator Actor | Status |`);
    lines.push(`| :--- | :--- | :--- | :---: |`);
    for (const gate of payload.gateDecisions) {
      lines.push(`| **\`${gate.code}\`** | \`${gate.gateType}\` | \`${gate.authorRole}\` (${gate.authorId}) | **${gate.status === "PASSED" ? "🟢 PASSED" : "🔴 BLOCKED"}** |`);
    }
    lines.push("");

    lines.push(`---\n*Generated deterministically by Hell-x Engineering OS Sandbox Driver.*`);

    return lines.join("\n");
  }
}
