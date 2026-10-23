# Ops Nexus World Layer

Updated: 2026-03-14

This document tracks the expanded campaign and world-simulation layer wired through `apps/ops-nexus.html` and persisted through `index.html`.

## Campaign Spine

The live campaign now runs as a 13-act structure:

1. Entry
2. Discovery
3. Corporate Shadows
4. Underground Networks
5. Digital Arms Race
6. Ghost Networks
7. Information Warfare
8. Hidden Architect
9. Global Instability
10. Betrayal Protocol
11. Truth Layer
12. System Override
13. Final Network War

Each act now has:
- a boss
- route directives for `ghost`, `crown`, and `void`
- app-gated requirements
- prep-cost gating
- a cash/research reward path

Late-game gates now include:
- Mara trust
- Director Vale reveal
- discovered shadow nodes
- faction/infrastructure progression

## Factions

The living world layer currently simulates six major factions:

- Orbital Helix
- Directorate Nine
- Glass Choir
- Saint Ledger
- Burn Route Syndicate
- Null Section

Each faction tracks:
- trust
- influence
- aggression
- heat
- territory
- activity

Faction state shifts through:
- campaign directives
- boss kills
- passive world simulation
- faction contract requests

## Internet Simulation

The persistent internet layer now stores:
- surface nodes
- shadow nodes
- discovered node IDs
- live world signals
- faction ownership
- dark economy state
- a current world pulse

Node metadata includes:
- owner type
- region
- security / firewall / encryption
- bandwidth / processing / data value
- monitoring / heat
- vulnerabilities
- hierarchy
- faction ownership
- activity state

The seeded network includes:
- telecom backbones
- exchanges
- corporate HQs
- finance nodes
- hospital / university clusters
- government archives
- industrial control systems
- courier cloud infrastructure
- media networks
- AI clusters
- shadow vaults / rogue AI clusters / ghost relays

## New Player Loops

Ops Nexus now supports:
- scanning the surface net
- scanning the shadow net
- staging contracts directly from discovered nodes
- requesting contracts from factions
- world-signal staging
- dark-economy monitoring

Generated node missions can now feed footholds back into the player's `networkNodes` list in the main save.

## Persistence

The parent runtime now persists:
- `internetNodes`
- `discoveredNodeIds`
- `shadowNodeIds`
- `worldSignals`
- `claimedSignalIds`
- `factionState`
- `darkEconomy`
- `worldPulse`
- `lastWorldSimAt`

## QA Notes

Verified:
- `apps/ops-nexus.html` script parses with `node --check`

Not yet verified:
- full browser playthrough
- long-run balancing of dark economy / faction drift
- end-to-end campaign route completion in the live UI
- edge-case interactions with older saves beyond schema normalization
