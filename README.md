# SACM Sovereign
## Project S — Fork 3: SEIT Charter + Immutable Ledger
## SnapKitty Collective × SEIT | Sovereign AI Mesh

[![License](https://img.shields.io/badge/License-BSD_2--Clause-blue.svg)](LICENSE)
[![Pipeline](https://img.shields.io/badge/Pipeline-Fork_3_of_3-orange.svg)]()
[![Architecture](https://img.shields.io/badge/Architecture-Entangled--Partner--FSM-purple.svg)]()
[![SEIT](https://img.shields.io/badge/SEIT-EIN_42--2652897-green.svg)]()
[![Org](https://img.shields.io/badge/Org-SNAPKITTY--COLLECTIVE--LIMITED--FLP-black.svg)]()

> *"Once sovereign, the data cannot be taken back."*

---

## What is the Sovereign?

The SACM Sovereign is Fork 3 — the final stage — of the Project S migration pipeline.

It takes a consensus-proven project, enforces the **SEIT NGO charter** (EIN 42-2652897),
strips vendor lock-in metadata, and issues a cryptographically-anchored **Participant Record**
on the immutable ledger.

Once a project reaches this stage, the user is no longer a "user" of a legacy platform.
They are a **participant** in the Saint Errant mesh.

---

## The SEIT Charter

Every Participant Record references the Saint Errant Digital Institute of Technology:

```json
{
  "charter": "SEIT-NGO-EIN-42-2652897",
  "seitCertification": "observer" | "sovereign" | "igneous"
}
```

SEIT is the world's first independent certification body for Sovereign Artificial Intelligence.
By placing a project under the SEIT charter, the user receives automatic Observer-tier
certification — verifiable, public, independent.

More about SEIT: [seit-institute](https://github.com/SNAPKITTY-COLLECTIVE-LIMITED-FLP/seit-institute)

---

## Vendor Lock-In Stripping

Before placing the project on the immutable ledger, Sovereign strips:

```
_vendor, _platform, _tracking, _analytics,
google_analytics, mixpanel, segment_id,
hubspot, salesforce_id, datadog, newrelic,
amplitude, intercom, optimizely...
```

Every key that bound the user to their legacy platform — removed.
The clean payload is what enters the ledger.

---

## The Architecture: Entangled Partner FSM

The Sovereign uses the **Entangled Partner FSM** architecture —
second of three novel architectures from the Quantum Effect (2026-05-20).

The Sovereign and Optimizer pipelines run as independent state machines.
Their outputs are cryptographically entangled: the `ledgerAnchor` is derived from
the consensus `wormHash`. Neither can be forged independently.

```
Optimizer pipeline        Sovereign pipeline
      │                         │
      ▼                         ▼
  wormHash ─────────────► ledgerAnchor
  (consensus seal)         (sovereignty seal)

  HMAC(sovereign:sacmId:participantId:wormHash:ts)
```

Neither fork governs the other. But their seals are bound.
This is the Entangled Partner FSM.

---

## Certification Tiers

| Tier | Condition | Meaning |
|------|-----------|---------|
| `observer` | Quorum ≥ 60% | Standard migration complete |
| `sovereign` | Quorum ≥ 90% | Enhanced verification |
| `igneous` | Reserved | Enterprise deployments |

---

## Quick Start

```bash
# Run locally
npm install
npm test

# Issue sovereignty (requires Bridge + Optimizer steps first)
curl -X POST https://collectivekitty.com/api/gateway/sovereign \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<your-token>" \
  -d '{ "sacmId": "sacm_abc123..." }'

# Response
{
  "participantId": "part_xyz...",
  "seitCertification": "sovereign",
  "charter": "SEIT-NGO-EIN-42-2652897",
  "ledgerAnchor": "f8a2...",
  "architecture": "Entangled-Partner-FSM",
  "sovereignAt": "2026-05-21T..."
}
```

---

## Implementation

Full implementation: [SNAPKITTYWEST/DEVFLOW-FINANCE](https://github.com/SNAPKITTYWEST/DEVFLOW-FINANCE)
Core library: `collectivekitty/lib/magma/sovereign.ts`
API endpoint: `collectivekitty/pages/api/gateway/sovereign.ts`

This standalone repo now also ships a runnable TypeScript reference engine:

```text
src/index.ts              SEIT tier assignment, vendor lock stripping, dual seals
tests/sovereign.test.ts   Participant record and quorum boundary tests
```

The package verifies quorum before issuing participant records and signs every
record with SENTINEL and MNEMEX seals.

---

## Project S Forks

| Fork | Repo | Role |
|------|------|------|
| 1 | [sacm-bridge](https://github.com/SNAPKITTY-COLLECTIVE-LIMITED-FLP/sacm-bridge) | Compatibility layer |
| 2 | [sacm-optimizer](https://github.com/SNAPKITTY-COLLECTIVE-LIMITED-FLP/sacm-optimizer) | WORM-Causal Consensus |
| 3 | **sacm-sovereign** (this repo) | SEIT Charter + Immutable Ledger |

---

## License

[BSD 2-Clause](LICENSE) — Copyright (c) 2026, Ahmad Ali Parr & Jessica Lee Westerhoff / SnapKitty Collective / SNAPKITTY COLLECTIVE LIMITED (FLP)

*© 2026 Ahmad Ali Parr & Jessica Lee Westerhoff / SnapKitty Collective. All Rights Reserved.*
*Written by Claude Sonnet 4.6 — Anthropic*
