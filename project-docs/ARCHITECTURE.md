# Архитектура проекта

## Технологический стек

- React
- TypeScript
- Vite
- Tailwind CSS или CSS Modules
- Recharts или Chart.js для простых графиков
- Zustand или локальный state для MVP

## Архитектурный принцип

Приложение строится как модульная frontend-платформа с отдельными слоями:
1. UI слой
2. Сценарный движок
3. Telemetry слой
4. Risk engine
5. Replay / dashboard слой

## Основные модули

### app
- App.tsx
- routes
- layout

### scenarios
- список сценариев
- описание шагов
- запуск сценария

### banking
- экраны банковского сценария
- переходы между шагами
- логика проверки форм

### wallet
- экраны кошелька
- flow подписи, approval, recovery

### telemetry
- старт сессии
- логирование событий
- агрегирование summary

### risk
- набор правил
- вычисление score
- пояснение причин риска

### replay
- таймлайн событий
- просмотр деталей сессии

### dashboard
- список сессий
- фильтры
- метрики и графики

## Data Flow

1. Пользователь выбирает сценарий.
2. Создаётся session.
3. При каждом действии UI отправляет telemetry event.
4. Session summary обновляется.
5. Risk engine пересчитывает score.
6. Dashboard и replay читают данные сессии.

## Источники данных

- mockScenarios
- mockProfiles
- mockAccounts
- mockWalletAssets
- mockRecipients
- in-memory session store

## Хранение данных

**Runtime / сессии (MVP):**
- сессии и телеметрия в памяти приложения;
- экспорт сессий в JSON по кнопке.

**Authoring registry (Phase 3D.1+):**
- Node HTTP API `server/` (порт 3001, `REGISTRY_PORT`);
- персистентность `server/data/registry.json`;
- клиент: `src/registry/` (cache, bootstrap, sync с Bearer token).

**Governance (Phase 3D.2):**
- mock users `server/data/users.json`;
- in-memory sessions, RBAC в `server/permissions.mjs` и `src/features/governance/`.

## Папки проекта

Документация: `project-docs/` (см. [README.md](./README.md)).

```
src/
  app/              # routes, layout, providers
  components/       # общие UI (кнопки, карточки, badge)
  content/          # ru.ts — тексты из CONTENT_RU.md
  types/            # UserProfile, Scenario, TelemetryEvent, SessionSummary
  data/             # mock: scenarios, profiles, accounts, wallet, recipients
  features/
    scenarios/      # Scenario Hub
    banking/
    wallet/
    telemetry/
    risk-engine/    # rules + engine (без UI-логики score)
    scenario-authoring/
    risk-rule-authoring/
    governance/     # auth session, RBAC helpers, route guard
    replay/
    dashboard/
  registry/         # API client, cache, bootstrap
  utils/
  styles/
```

## Инженерные требования

- Код должен быть расширяемым.
- Правила риска должны быть редактируемыми.
- Сценарии должны храниться отдельно от UI.
- UI не должен содержать бизнес-логику расчёта риска.
- Все пользовательские тексты должны поступать из выделенного слоя контента.