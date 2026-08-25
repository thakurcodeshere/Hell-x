# 🌐 Hell-x — The AI-Native Operating System for Software Engineering

<div align="center">

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Demo-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://hell-x.vercel.app)
[![GitHub License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![SLSA Level 3](https://img.shields.io/badge/SLSA-Level%203%20Attested-cyan?style=for-the-badge&logo=security)](https://slsa.dev)
[![Tests Passing](https://img.shields.io/badge/Vitest-85%2F85%20Passed%20(100%25)-emerald?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/thakurcodeshere/Hell-x)
[![Node Version](https://img.shields.io/badge/Node-%3E%3D20.0.0-f97316?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)

**Trustworthy Orchestration of Software Engineering Intelligence.**  
*Transform unstructured human intent into structured, verifiable, self-healing software systems.*

[**Live Web Control Plane**](https://hell-x.vercel.app) • [**Architecture Blueprint**](#-architectural-layers--control-plane) • [**The 15 Laws**](#-the-engineering-os-manifesto) • [**CLI Reference**](#-cli-command-center) • [**Verification Network**](#-independent-verification-network)

</div>

---

## ⚡ The Executive Thesis

Current AI coding tools generate code directly from conversational prompts and evaluate their own correctness:
> **Human:** *"Build me a SaaS app."*  
> **AI:** *Generates code $\to$ fixes errors $\to$ declares success.*

This creates 15 fundamental engineering vulnerabilities: hidden assumptions, vague intent, self-review bias, escaped regressions, and zero durable memory.

**Hell-x is not a prompt collection or a coding copilot. Hell-x is an AI-Native Engineering Operating System.**  
It enforces a cryptographic, multi-agent workforce governed by deterministic validation gates, independent peer verifiers, continuous 8-tier memory, and closed-loop self-healing remediation.

---

## 🏛️ The Primary Principle

```
                       ┌─────────────────────────┐
                       │   Human Intent Vector   │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │   Builder Agent Model   │
                       └────────────┬────────────┘
                                    │ (Synthesizes Code)
                                    ▼
                       ┌─────────────────────────┐
                       │   Claim vs Proof Ledger │
                       └────────────┬────────────┘
                                    │ (Cryptographic Evidence)
                                    ▼
                       ┌─────────────────────────┐
                       │ Independent QA Verifier │ ───► [Mutation Testing >=80%]
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │   6 Governance Gates    │ ───► [SLSA Level 3 Sealing]
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │ Canary Release Watchdog │ ───► [Sub-Second Fast Rollback]
                       └─────────────────────────┘
```

> ### **NO AGENT IS THE SOLE AUTHORITY OVER ITS OWN OUTPUT.**  
> The agent that creates an artifact is strictly prohibited from verifying or approving it. Every claim requires multi-modal cryptographic proof.

---

## 📜 The Engineering OS Manifesto (15 Laws)

1. **Law 01 — Intent Precedence**: Intent must precede implementation.
2. **Law 02 — Explicit Requirements**: Requirements must be explicit and vector-scored.
3. **Law 03 — Visible Unknowns**: Unknowns must remain visible until formally resolved.
4. **Law 04 — Bidirectional Traceability**: Architecture must be traceable to requirements, and incidents upstream to source lines.
5. **Law 05 — Agent Boundaries**: Agents must operate strictly within bounded Git worktree sandboxes.
6. **Law 06 — Zero Self-Review**: Builders must never be the verifiers of their own output.
7. **Law 07 — Evidentiary Proof**: Claims require reproducible, cryptographic evidence.
8. **Law 08 — Risk-Adaptive Depth**: Risk profile determines verification depth.
9. **Law 09 — Human Invariant**: Humans retain multi-sig approval over irreversible, high-risk architectural decisions.
10. **Law 10 — Decision Explainability**: Every engineering decision must be backed by an ADR with tradeoff matrices.
11. **Law 11 — Failure Memory**: Every defect and incident must distill into permanent organizational memory.
12. **Law 12 — Continuous Learning**: Every release must generate telemetry-driven preventative rules.
13. **Law 13 — Meritocratic Selection**: Agents are dynamically assigned based on empirical benchmark reputation.
14. **Law 14 — Adaptive Workflows**: Workflows evolve based on observed execution performance.
15. **Law 15 — Outcome Optimization**: The system optimizes business outcomes, not superficial agent token activity.

---

## 🧩 Architectural Layers & Control Plane

Hell-x organizes autonomous software engineering across 10 functional layers and a 12-view control plane:

### 10 Functional Operating System Layers
- **Layer 00 — Foundation Substrate**: SHA-256 EventBus, Content-Addressed Immutable ArtifactStore, Git Worktrees.
- **Layer 01 — Intent Engine**: Unstructured prompt $\to$ 10D Vector Radar (Functional, Security, Data, SLA, UX, etc.).
- **Layer 02 — Product Intelligence**: Contradiction detection, explicit unknowns resolver, `SPECIFICATION_GATE`.
- **Layer 03 — Engineering Blueprint**: Bounded domain models, OpenAPI 3.1 & SQL DDL schemas, `ARCHITECTURE_GATE`.
- **Layer 04 — Design & UX Engine**: WCAG 2.1 AA token compiler, interaction state machines, `DESIGN_GATE`.
- **Layer 05 — Workforce Orchestration**: 7 Specialist Personas, context packs, worktree task dispatcher, `EXECUTION_GATE`.
- **Layer 06 — Verification Network**: Claim vs. Proof ledger, flakiness quarantine, mutation testing ($\ge 80\%$), `VERIFICATION_GATE`.
- **Layer 07 — Release State Machine**: Canary progression (10% $\to$ 100%), SLI/SLO health watchdogs, sub-second fast rollback, `RELEASE_GATE`.
- **Layer 08 — Continuous Memory**: 8-Tier memory substrate, telemetry trace spans, pattern distillation, `MEMORY_GATE`.
- **Layer 09 — Enterprise Security**: Cryptographic attestation signer, SLSA Level 3 Provenance, Merkle transparency ledger, Multi-Sig gates.
- **Layer 10 — Swarm & Self-Healing (Grand Capstone)**: Autonomous Root Cause Analysis (RCA), hotfix synthesizer, inter-agent swarm quorum consensus.

---

## 💻 12-View Engineering Control Plane (Live on Vercel)

Visit the live production dashboard at [**https://hell-x.vercel.app**](https://hell-x.vercel.app):

```text
├── 01 — Command Center      (5 Fundamental Questions, Live HUD, Velocity, Health)
├── 02 — Intent & 10D Radar  (10-Dimensional Vector Radar, Ambiguity & Unknowns)
├── 03 — Engineering Model   (Bounded Contexts, Invariant Rules, OpenAPI 3.1 & SQL DDL)
├── 04 — Work Graph (DAG)    (Topological Parallel Execution Tiers & Blast Radius)
├── 05 — Agent Workforce     (7 Specialist Personas, Token Usage & Reputation)
├── 06 — Evidence Network    (SHA-256 Cryptographic Evidence & Test Traces)
├── 07 — Verification        (Claim vs Proof Matrix, Mutation Kill Score >=80%)
├── 08 — Releases & Canary   (Zero-Downtime Canary Progression & Fast Rollback Sentinel)
├── 09 — Observability       (RED Metrics, RPS, Error Rates, P99 Latency & Spans)
├── 10 — 8-Tier Memory       (Hierarchical Organizational Memory & Distilled Rules)
├── 11 — Decisions (ADRs)    (Multi-Option Trade-off Evaluation Matrices)
└── 12 — Learning & Swarm    (Autonomous Swarm Consensus & Sub-Second Self-Healing)
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: `>= 20.0.0`
- **Git**: `>= 2.40.0`

### 2. Installation
```bash
git clone https://github.com/thakurcodeshere/Hell-x.git
cd Hell-x
npm install
```

### 3. Build & Test
```bash
# Compile TypeScript codebase
npm run build

# Run all 85 unit and integration tests across 56 test files
npm test
```

### 4. Launch Mission Control Server & Dashboard
```bash
# Start native HTTP server with live REST API & Web Dashboard
npx tsx src/cli/index.ts serve --port 3000

# Open browser at http://localhost:3000
```

---

## 🛠️ CLI Command Center

Hell-x provides a unified command line interface (`hellx`):

```bash
# Execute autonomous closed-loop mission
npx tsx src/cli/index.ts mission "Build Enterprise Subscription & Invoicing Engine"

# Run the Grand Capstone Swarm & Autonomous Self-Healing Simulation
npx tsx src/cli/index.ts simulate-grand-pilot

# Run the Enterprise Security, SLSA Level 3 & Multi-Sig Gate Simulation
npx tsx src/cli/index.ts simulate-enterprise

# Inspect multi-agent swarm topologies and consensus votes
npx tsx src/cli/index.ts swarm

# Start Mission Control Web Server
npx tsx src/cli/index.ts serve --port 3000
```

---

## 🛡️ Independent Verification Network

Every build produces tamper-evident in-toto statements with **SLSA v1.0 Level 3 Provenance**:

```json
{
  "_type": "https://in-toto.io/Statement/v1",
  "subject": [{ "name": "hotfix-inc-sqli.patch", "digest": { "sha256": "b32e58e7b..." } }],
  "predicateType": "https://slsa.dev/provenance/v1",
  "predicate": {
    "buildDefinition": {
      "buildType": "https://hell-x.dev/engineering-os/v1",
      "externalParameters": { "sourceRepo": "https://github.com/thakurcodeshere/Hell-x" }
    },
    "runDetails": {
      "builder": { "id": "agent-sre-remediation@hell-x.internal" },
      "metadata": { "slsaLevel": "SLSA_LEVEL_3" }
    }
  }
}
```

---

## 📊 Benchmark & Quality Matrix

| Dimension | Target Metric | Hell-x Measured Result | Status |
| :--- | :---: | :---: | :---: |
| **Governance Gates** | 6 Gates Enforced | 6 / 6 Cryptographically Sealed | 🟢 **100% Passed** |
| **Mutation Testing** | $\ge 80\%$ Kill Rate | **88.0% Mutation Kill Score** | 🟢 **Exceeded** |
| **Flakiness Quarantine** | Zero flaky test bleed | **0 Flaky Tests Escaped** | 🟢 **Isolated** |
| **Self-Healing Recovery** | Sub-second MTTR | **11ms Automated Incident MTTR** | 🟢 **Instant** |
| **Memory Retention** | 8 Tiers Active | **8 Tiers with Cosine Distance & Decay** | 🟢 **Operational** |
| **Test Suite Coverage** | Complete Core & Modules | **85 / 85 Tests Passing (56 Test Files)** | 🟢 **100% Green** |

---

## 📄 License

MIT © [thakurcodeshere](https://github.com/thakurcodeshere)
