# Симулятор уязвимости банковского приложения и цифрового кошелька

Исследовательское веб-приложение для моделирования банковских и wallet-сценариев социальной инженерии, сбора поведенческих событий и explainable оценки риска.

## Документация

Вся продуктовая и техническая документация — в папке [`project-docs/`](./project-docs/):

| Файл | Содержание |
|------|------------|
| [PRD.md](./project-docs/PRD.md) | Требования и scope MVP |
| [ARCHITECTURE.md](./project-docs/ARCHITECTURE.md) | Архитектура и структура `src/` |
| [DATA_SCHEMA.md](./project-docs/DATA_SCHEMA.md) | Типы данных |
| [RISK_RULES.md](./project-docs/RISK_RULES.md) | Правила risk engine |
| [CONTENT_RU.md](./project-docs/CONTENT_RU.md) | UI-тексты (source of truth) |
| [SCENARIOS_RU.md](./project-docs/SCENARIOS_RU.md) | Каталог сценариев (source of truth) |
| [IMPLEMENTATION_STATUS.md](./project-docs/IMPLEMENTATION_STATUS.md) | Текущая фаза vs DATA_SCHEMA |
| [SESSION_CONTRACT.md](./project-docs/SESSION_CONTRACT.md) | Frozen session / flow / risk contract |

## Запуск

```bash
npm install
npm run dev:registry   # терминал 1 — API реестра (порт 3001)
npm run dev            # терминал 2 — Vite (прокси /api → registry)
```

Если порт 3001 занят: `REGISTRY_PORT=3011 npm run dev:registry` и в том же терминале/сессии `REGISTRY_PORT=3011 npm run dev` (Vite proxy читает ту же переменную).

Данные authored-конфигов: `server/data/registry.json`. При первом запуске с непустым localStorage выполняется автоматическая миграция в backend.

### Governance (Phase 3D.2)

Authoring workspace и registry API требуют входа. Демо-учётки (mock `server/data/users.json`):

| Логин | Пароль | Роль |
|-------|--------|------|
| `viewer` | `viewer` | только чтение |
| `editor` | `editor` | черновики, импорт |
| `publisher` | `publisher` | + публикация и удаление версий |

Страница входа: `/admin/login`. Симулятор сценариев (хаб, banking, wallet) доступен без входа.

### Audit & review (Phase 3D.3)

- Review states: `draft` → `in_review` → `published` (в runtime попадают только `published`)
- Audit trail в `registry.json` (`auditLog[]`); история в UI редактора
- Editor: «Отправить на ревью» + optional note; Publisher: publish с optional note

Проверки: `npm run dev:registry` → `npm run check:phase3d3` (также `check:phase3d2`, `check:phase3d1`).

### Analytics Dashboard (Phase 3E.1)

- Read-only слой аналитики над завершёнными сессиями из `useSessionStore` (без изменений runtime / telemetry контрактов)
- Страница: `/dashboard` (навигация «Аналитика»)
- Агрегация: completion / abandonment / stopped rates, распределения outcomes и risk levels, топ risk flags, эффективность правил, сравнение сценариев, high-risk разбор
- Фильтры: сценарий, simulatorType, дата, outcome, risk level, профиль
- Экспорт: summary JSON/CSV, sessions JSON, raw CSV, comparative CSV

Проверка: `npm run check:phase3e1`

### Analytics Drilldowns (Phase 3E.2)

- Drilldown: `/dashboard/scenario/:id`, `/dashboard/flag/:id`, `/dashboard/rule/:id`, `/dashboard/session/:id` (explainability)
- Сравнение: `/dashboard/compare?mode=scenario|simulator|timeRange`
- Insight blocks на dashboard; clickable charts/tables; breadcrumbs; фильтры в URL

Проверка: `npm run check:phase3e2`

### Session Archive (Phase 4A.1)

- Backend persistence: `server/data/session-archive.json`
- API: `GET/POST /api/archive/sessions`, `GET /api/archive/sessions/:id`, `POST /api/archive/sessions/import`
- При завершении сессии — append в archive (non-blocking); analytics/replay читают archive + local merge
- Миграция: при открытии analytics — import локальных ended-сессий в archive

Проверка: `npm run dev:registry` → `npm run check:phase4a1`

## Деплой (GitHub + Vercel)

Репозиторий: [github.com/coprum96/simulation_scam_app](https://github.com/coprum96/simulation_scam_app)

Импорт в [Vercel](https://vercel.com/coprum96s-projects): Framework **Vite**, Build `npm run build`, Output `dist`. Роутинг SPA и `/api/*` — в `vercel.json`.

> На Vercel serverless registry/archive **эфемерны** (данные не как на локальном диске). Симуляции и UI работают; для полного authoring — локально с `dev:registry`.

```bash
npx vercel login
npx vercel link
npx vercel --prod
```

## Принципы

- UI только на русском
- Mock-данные, без реальных API и брендов
- Risk-логика отделена от UI
