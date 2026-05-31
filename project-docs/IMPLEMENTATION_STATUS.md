# Статус реализации

**Frozen contract:** [SESSION_CONTRACT.md](./SESSION_CONTRACT.md) · **Risk rules:** [RISK_RULES.md](./RISK_RULES.md)

## Текущая фаза

**Phase 3E.1 — Analytics Dashboard MVP** ✅

| Слой | Статус | Где |
|------|--------|-----|
| Telemetry + session store | ✅ | `src/features/telemetry/` |
| Banking Flow MVP | ✅ | `src/features/banking/` |
| Wallet Flow MVP | ✅ | `src/features/wallet/` |
| Risk Engine (rule-based MVP) | ✅ | `src/features/risk-engine/` |
| Last session risk panel | ✅ | `src/components/risk/LastSessionRiskPanel.tsx` |
| SessionRiskReport helper | ✅ | `buildSessionRiskReport()` |
| Session Replay MVP | ✅ | `src/features/session-replay/` |
| Dashboard MVP | ✅ | `src/features/dashboard/` |
| Export JSON MVP | ✅ | `src/features/export/` |
| Scenario authoring MVP | ✅ | `src/features/scenario-authoring/` |
| Risk rule authoring MVP | ✅ | `src/features/risk-rule-authoring/` |
| Backend authoring registry (3D.1) | ✅ | `server/`, `src/registry/` |
| Governance: auth + RBAC (3D.2) | ✅ | `server/auth.mjs`, `src/features/governance/` |
| Audit trail + review workflow (3D.3) | ✅ | `server/audit.mjs`, `src/features/authoring-audit/` |
| Research analytics dashboard (3E.1) | ✅ | `src/features/analytics/` |

## Phase 3E.1 — что сделано

- Read-only analytics над `useSessionStore` (ended sessions)
- Агрегация: outcomes, rates, duration, risk distribution, flags, rule effectiveness
- Сравнение сценариев, high-risk breakdown, outcome×risk correlation
- Фильтры: scenario, simulator, profile, outcome, risk level, date range
- Экспорт summary JSON/CSV + существующие session/comparative exports

**Проверки:** `npm run check:phase3e1`

## Phase 3D.3 — что сделано

- Audit log в `registry.json` (`auditLog[]`): created, edited, imported, published, deleted, submitted_review
- Lifecycle на документе: `lastModifiedBy/At`, `publishedBy/At`, `lastPublishNote`
- Review states: `draft` → `in_review` → `published` (runtime только `published`)
- API: `GET .../audit`, `POST .../submit-review`, publish с `{ note }`
- UI: history panel, lifecycle indicators, publish/review note, list columns

**Проверки:** `npm run check:phase3d3` (после `dev:registry`).

## Phase 3D.2 — что сделано

- Mock auth: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- Роли: `viewer`, `editor`, `publisher` (`server/data/users.json`)
- API permission checks на всех `/api/*` кроме health и auth
- Route guard для `/authoring` и `/risk-authoring` → `/admin/login`
- UI: disabled actions, баннеры ролей, тексты в `ru.governance`
- Публичный runtime (хаб, banking, wallet) без входа; builtin baseline без изменений

**Проверки:** `npm run dev:registry` → `npm run check:phase3d2` (и `check:phase3d1` для registry CRUD).

## Risk pipeline

`endSession` → `record.status = ended` + `outcome` → `computeSessionSummary()` → `evaluateRisk()` → `applyRiskToSession()` (summary + record).
