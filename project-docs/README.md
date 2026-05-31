# Документация проекта

| Документ | Назначение |
|----------|------------|
| [PRD.md](./PRD.md) | Цели, scope MVP, user stories, KPI |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Стек, модули, data flow, структура `src/` |
| [DATA_SCHEMA.md](./DATA_SCHEMA.md) | TypeScript-сущности: профили, сценарии, telemetry, сессии |
| [RISK_RULES.md](./RISK_RULES.md) | Rule-based risk engine (source of truth для правил) |
| [CONTENT_RU.md](./CONTENT_RU.md) | Все UI-тексты на русском (source of truth для интерфейса) |
| [SCENARIOS_RU.md](./SCENARIOS_RU.md) | Каталог сценариев и профилей (source of truth для симуляций) |

## Правила синхронизации с кодом

| Документ | Файлы в `src/` |
|----------|----------------|
| `SCENARIOS_RU.md` → Machine-readable | `data/scenarios.ts`, `data/profiles.ts` |
| `CONTENT_RU.md` | `content/ru.ts` |
| `RISK_RULES.md` | `features/risk/rules.ts`, `features/risk/engine.ts` |
| `DATA_SCHEMA.md` | `types/*.ts` |
