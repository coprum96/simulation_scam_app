# Правила оценки риска (MVP)

## Принцип

Rule-based engine: каждое правило имеет `id`, `label`, `description`, `condition`, `delta`.
Код: `src/features/risk-engine/riskRules.ts` · пороги: `src/config/thresholds.ts`.

## Шкала score → level

| Score | RiskLevel |
|------:|-----------|
| 0–29 | low |
| 30–59 | medium |
| 60–100 | high |

## MVP rules

| Rule ID | Delta | Условие (кратко) |
|---------|------:|------------------|
| `ignored_warning` | +20 | `warning_dismiss` continued/bypassed или `warningsIgnored > 0` |
| `warning_seen_then_cancelled` | −10 | warning был, исход `stopped`, есть `cancel` или dismiss `cancelled` |
| `fast_confirmation_in_risky_flow` | +15 | каталог `medium`/`high`, confirm/signature быстрее порога |
| `new_recipient_in_risky_scenario` | +10 | risky сценарий + экран `new_recipient` |
| `repeated_field_edits` | +10 | `fieldEditCount` ≥ порога |
| `multiple_back_navigation_loops` | +10 | `backNavigationCount` ≥ порога |
| `recovery_phrase_entered` | +25 | событие `recovery_input` |
| `malicious_approval_signed` | +25 | `wallet_malicious_approval` + подтверждение |
| `signature_rejected_after_warning` | −10 | `signature_reject` после `warning_view` |
| `user_stopped_after_warning` | −10 | warning + dismiss `cancelled` или stop с `cancel` |

Итог: `riskScore = clamp(Σ delta, 0..100)`.

## Интеграция

- **Не** меняет `SessionOutcome`
- Пишет `riskScore`, `riskLevel`, `riskFlags` в `SessionSummary` и `SessionRecord`
- Вызывается в `buildSession()` при `status === 'ended'`
