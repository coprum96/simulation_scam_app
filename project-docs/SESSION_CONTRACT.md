# Session / Flow / Risk — canonical contract (frozen)

**Source of truth в коде:** `src/types/contracts.ts` · risk types: `src/types/risk.ts`

## Enums

| Contract | Values |
|----------|--------|
| `SessionStatus` | `active`, `ended` |
| `SessionOutcome` | `completed`, `stopped`, `abandoned` |
| `FlowResultType` | `confirmed`, `cancelled`, `rejected`, `escalated` |
| `RiskLevel` | `low`, `medium`, `high` |

`safe` / `risky` — **не** `SessionOutcome`. Только risk UI / labels / docs.

## Session shape

```
Session
├── record   — lifecycle + ids + outcome + risk (после end)
├── events   — raw telemetry
└── summary  — aggregates + risk (risk заполняет Risk Engine)
```

## SessionSummary fields

| Group | Fields |
|-------|--------|
| Identity / time | `sessionId`, `scenarioId`, `profileId`, `status`, `startedAt`, `endedAt`, `totalDurationMs` |
| Telemetry | `screensVisited`, `totalEvents`, `eventCounts` |
| Behavioral | `warningsSeen`, `warningsIgnored`, `fieldEditCount`, `backNavigationCount`, `confirmationDelayMs` |
| Risk | `riskScore`, `riskLevel`, `riskFlags` |

## Risk Engine

- Input: `events`, `SessionBehavioralMetrics`, `Scenario`, `SessionRecord`
- Output: `RiskAssessment` → merged into `SessionSummary` и `SessionRecord`
- **Не** меняет `SessionOutcome`

## Mapping `FlowResultType` → `SessionOutcome` (on exit)

| FlowResultType | SessionOutcome |
|----------------|----------------|
| `confirmed` | `completed` |
| `escalated` | `completed` |
| `cancelled` | `stopped` |
| `rejected` | `stopped` |
