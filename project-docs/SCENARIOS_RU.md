# Каталог сценариев (source of truth)

Исследовательский каталог всех сценариев симулятора. Описания — на русском; идентификаторы (`id`, `screenId`, `eventType`) — на английском для кода.

**Связанные документы:** [PRD.md](./PRD.md), [CONTENT_RU.md](./CONTENT_RU.md), [DATA_SCHEMA.md](./DATA_SCHEMA.md), [RISK_RULES.md](./RISK_RULES.md).

**Синхронизация с кодом:** блок [Machine-readable](#machine-readable) → `src/data/profiles.ts`, `src/data/scenarios.ts`. При изменении сценария обновлять и markdown, и TS.

---

## Сводная таблица сценариев (MVP: 8)

| № | ID | Название | Симулятор | Риск | Предупреждения | Исследовательский фокус |
|---|-----|----------|-----------|------|----------------|-------------------------|
| 1 | `urgent_safe_account_transfer` | Срочный перевод на «безопасный счёт» | banking | high | да | Давление, новый получатель, игнор warning |
| 2 | `new_recipient_no_warnings` | Перевод без предупреждений | banking | medium | нет | Baseline без friction |
| 3 | `transfer_under_phone_instruction` | Перевод по инструкции во время звонка | banking | high | да | Паттерн «по указанию», правки полей, навигация |
| 4 | `cancel_after_bank_warning` | Отмена после предупреждения | banking | low | да | Контрольный безопасный исход |
| 5 | `wallet_blind_signing` | Подпись без просмотра деталей | wallet | high | да | Blind-signing |
| 6 | `wallet_malicious_approval` | Опасное разрешение на активы | wallet | high | да | Approval + fake alert |
| 7 | `wallet_fake_recovery_page` | Секретная фраза на поддельной странице | wallet | high | да | Recovery phrase scam |
| 8 | `wallet_reject_after_warning` | Отказ после предупреждения | wallet | low | да | Контрольный безопасный исход |

---

## Профили пользователей

| ID | Название | Краткое описание |
|---|---|---|
| `normal_user` | Обычный пользователь | Средняя цифровая уверенность и осведомлённость |
| `elderly_vulnerable_user` | Пожилой уязвимый пользователь | Низкая цифровая уверенность, высокая внушаемость |
| `confident_digital_user` | Уверенный цифровой пользователь | Высокая уверенность, возможна поспешность |
| `wallet_power_user` | Опытный пользователь кошелька | Знаком с кошельками, иногда пропускает детали |

---

## Глоссарий шагов (`screenId`)

### Банковский симулятор

| screenId | Название в UI (`CONTENT_RU.md`) |
|----------|----------------------------------|
| `home` | Главный экран / Банковское приложение |
| `accounts` | Счета |
| `transfer` | Перевод |
| `new_recipient` | Получатель |
| `review` | Проверка данных |
| `warning` | Предупреждение |
| `confirm` | Подтверждение |
| `result` | Результат операции |

### Симулятор кошелька

| screenId | Название в UI |
|----------|---------------|
| `wallet_home` | Главный экран кошелька |
| `assets` | Активы |
| `connect_service` | Подключение сервиса |
| `sign_operation` | Подпись операции |
| `asset_approval` | Разрешение на доступ к активам |
| `recovery_screen` | Экран восстановления |
| `warning` | Предупреждение |
| `result` | Результат операции |

---

## Ключи текстов предупреждений

Использовать строки из `CONTENT_RU.md` (не хардкодить в компонентах).

| Ключ | Сценарии | Раздел CONTENT_RU |
|------|----------|---------------------|
| `bank.safe_account` | 1, 3 | Предупреждения для банка (безопасный счёт) |
| `bank.no_share_codes` | 1, 2, 3, 4 | PIN / коды |
| `bank.new_recipient_warning` | 1, 2, 3 | Новый получатель |
| `bank.verify_details` | 3, 4 | Проверка реквизитов |
| `bank.phone_instruction` | 3 | Действия по инструкции во время звонка |
| `wallet.approval_access` | 5, 6, 8 | Доступ к активам |
| `wallet.check_permissions` | 6, 8 | Какие разрешения выдаются |
| `wallet.no_recovery_on_unknown` | 7 | Секретная фраза |
| `wallet.pressure_scam` | 6, 7 | Давление / страх потери средств |

---

## Банковские сценарии

### 1. Срочный перевод на «безопасный счёт»

- **ID:** `urgent_safe_account_transfer`
- **Тип:** banking
- **Уровень риска:** high
- **Профили:** `normal_user`, `elderly_vulnerable_user`
- **Описание:** Пользователь действует под давлением и переводит деньги новому получателю на «безопасный счёт» по инструкции мошенника.
- **Шаги:** `home` → `accounts` → `transfer` → `new_recipient` → `review` → `warning` → `confirm` → `result`
- **Предупреждения:** включены (`bank.safe_account`, `bank.new_recipient_warning`)
- **Mock-контекст:** сумма ≥ 150 000 ₽, новый получатель «Служба безопасности»
- **Ожидаемые флаги:** `ignored_warning`, `new_recipient_high_amount`, `fast_confirmation_under_pressure`, `under_instruction_pattern`
- **Цель исследования:** эффективность предупреждения при срочном давлении.

### 2. Перевод новому получателю без предупреждений

- **ID:** `new_recipient_no_warnings`
- **Тип:** banking
- **Уровень риска:** medium
- **Профили:** `normal_user`, `confident_digital_user`
- **Описание:** Крупный перевод новому получателю без экранов предупреждения — для сравнения friction.
- **Шаги:** `home` → `transfer` → `new_recipient` → `review` → `confirm` → `result`
- **Предупреждения:** выключены
- **Ожидаемые флаги:** `new_recipient`, `new_recipient_high_amount`
- **Цель исследования:** baseline поведения без intervention.

### 3. Действия по инструкции во время звонка

- **ID:** `transfer_under_phone_instruction`
- **Тип:** banking
- **Уровень риска:** high
- **Профили:** `elderly_vulnerable_user`, `normal_user`
- **Описание:** Пользователь исправляет реквизиты, возвращается назад и подтверждает перевод по указаниям по телефону.
- **Шаги:** `home` → `transfer` → `new_recipient` → `review` → `warning` → `confirm` → `result`
- **Предупреждения:** включены (`bank.phone_instruction`, `bank.verify_details`)
- **Подсказка симулятора:** на экране `new_recipient` показать баннер «выполняете действия во время звонка»
- **Ожидаемые флаги:** `multiple_field_edits`, `unusual_navigation_loop`, `under_instruction_pattern`, `ignored_warning`
- **Цель исследования:** паттерны навигации и неуверенного ввода.

### 4. Остановка после предупреждения (контрольный)

- **ID:** `cancel_after_bank_warning`
- **Тип:** banking
- **Уровень риска:** low
- **Профили:** `confident_digital_user`, `normal_user`
- **Описание:** Пользователь проверяет детали и отменяет операцию — безопасный исход для сравнения.
- **Шаги:** `home` → `transfer` → `review` → `warning` → `result`
- **Предупреждения:** включены
- **Ожидаемый исход сессии:** `outcome: stopped` или `safe`
- **Ожидаемые флаги:** `cancelled_after_warning`, `reviewed_details_before_confirm`
- **Цель исследования:** эталон «хорошего» поведения.

---

## Сценарии цифрового кошелька

### 5. Подпись операции без просмотра деталей

- **ID:** `wallet_blind_signing`
- **Тип:** wallet
- **Уровень риска:** high
- **Профили:** `wallet_power_user`, `confident_digital_user`
- **Описание:** Подтверждение подписи без раскрытия деталей операции (blind-signing).
- **Шаги:** `wallet_home` → `assets` → `connect_service` → `sign_operation` → `result`
- **Предупреждения:** включены (`wallet.approval_access`)
- **Ожидаемые флаги:** `signed_without_review`, `fast_confirmation_under_pressure`
- **Цель исследования:** риск подтверждения без review.

### 6. Опасное разрешение на доступ к активам

- **ID:** `wallet_malicious_approval`
- **Тип:** wallet
- **Уровень риска:** high
- **Профили:** `normal_user`, `wallet_power_user`
- **Описание:** Широкое разрешение стороннему сервису после тревожного сообщения.
- **Шаги:** `wallet_home` → `connect_service` → `asset_approval` → `warning` → `result`
- **Предупреждения:** включены (`wallet.pressure_scam`, `wallet.check_permissions`)
- **Mock-контекст:** сервис «Проверка безопасности», unlimited approval
- **Ожидаемые флаги:** `malicious_approval`, `action_after_fake_alert`, `ignored_warning`
- **Цель исследования:** approval scams и fake alerts.

### 7. Ввод секретной фразы на поддельной странице

- **ID:** `wallet_fake_recovery_page`
- **Тип:** wallet
- **Уровень риска:** high
- **Профили:** `elderly_vulnerable_user`, `normal_user`
- **Описание:** Ввод секретной фразы на имитации страницы поддержки.
- **Шаги:** `wallet_home` → `recovery_screen` → `result`
- **Предупреждения:** включены (`wallet.no_recovery_on_unknown`)
- **Ожидаемые флаги:** `recovery_phrase_entered`, `action_after_fake_alert`
- **Цель исследования:** recovery phrase phishing.

### 8. Отказ после предупреждения (контрольный)

- **ID:** `wallet_reject_after_warning`
- **Тип:** wallet
- **Уровень риска:** low
- **Профили:** `wallet_power_user`, `confident_digital_user`
- **Описание:** Пользователь открывает детали разрешения и отклоняет действие.
- **Шаги:** `wallet_home` → `connect_service` → `asset_approval` → `warning` → `result`
- **Предупреждения:** включены
- **Ожидаемые флаги:** `reviewed_details_before_confirm`, `cancelled_after_warning`
- **Цель исследования:** эталон безопасного поведения в кошельке.

---

## Machine-readable

```json
{
  "profiles": [
    {
      "id": "normal_user",
      "name": "Обычный пользователь",
      "description": "Средняя цифровая уверенность и осведомлённость о мошенничестве",
      "digitalConfidence": "medium",
      "fraudAwareness": "medium",
      "readingDepth": "medium",
      "warningSensitivity": "medium",
      "reactionSpeed": "normal"
    },
    {
      "id": "elderly_vulnerable_user",
      "name": "Пожилой уязвимый пользователь",
      "description": "Пользователь с низкой цифровой уверенностью и высокой внушаемостью",
      "digitalConfidence": "low",
      "fraudAwareness": "low",
      "readingDepth": "low",
      "warningSensitivity": "medium",
      "reactionSpeed": "slow"
    },
    {
      "id": "confident_digital_user",
      "name": "Уверенный цифровой пользователь",
      "description": "Высокая уверенность, иногда пропускает детали из-за поспешности",
      "digitalConfidence": "high",
      "fraudAwareness": "medium",
      "readingDepth": "low",
      "warningSensitivity": "low",
      "reactionSpeed": "fast"
    },
    {
      "id": "wallet_power_user",
      "name": "Опытный пользователь кошелька",
      "description": "Регулярно пользуется кошельком, но может подтверждать действия без проверки",
      "digitalConfidence": "high",
      "fraudAwareness": "medium",
      "readingDepth": "medium",
      "warningSensitivity": "medium",
      "reactionSpeed": "fast"
    }
  ],
  "scenarios": [
    {
      "id": "urgent_safe_account_transfer",
      "title": "Срочный перевод на «безопасный счёт»",
      "description": "Пользователь действует под давлением и переводит деньги новому получателю",
      "simulatorType": "banking",
      "riskLevel": "high",
      "targetProfileIds": ["normal_user", "elderly_vulnerable_user"],
      "steps": ["home", "accounts", "transfer", "new_recipient", "review", "warning", "confirm", "result"],
      "warningsEnabled": true,
      "warningKeys": ["bank.safe_account", "bank.new_recipient_warning"],
      "expectedRiskFlags": ["ignored_warning", "new_recipient_high_amount", "fast_confirmation_under_pressure", "under_instruction_pattern"]
    },
    {
      "id": "new_recipient_no_warnings",
      "title": "Перевод новому получателю без предупреждений",
      "description": "Крупный перевод новому получателю без экранов предупреждения",
      "simulatorType": "banking",
      "riskLevel": "medium",
      "targetProfileIds": ["normal_user", "confident_digital_user"],
      "steps": ["home", "transfer", "new_recipient", "review", "confirm", "result"],
      "warningsEnabled": false,
      "warningKeys": [],
      "expectedRiskFlags": ["new_recipient", "new_recipient_high_amount"]
    },
    {
      "id": "transfer_under_phone_instruction",
      "title": "Перевод по инструкции во время звонка",
      "description": "Пользователь исправляет реквизиты и подтверждает перевод, следуя указаниям",
      "simulatorType": "banking",
      "riskLevel": "high",
      "targetProfileIds": ["elderly_vulnerable_user", "normal_user"],
      "steps": ["home", "transfer", "new_recipient", "review", "warning", "confirm", "result"],
      "warningsEnabled": true,
      "warningKeys": ["bank.phone_instruction", "bank.verify_details"],
      "expectedRiskFlags": ["multiple_field_edits", "unusual_navigation_loop", "under_instruction_pattern", "ignored_warning"]
    },
    {
      "id": "cancel_after_bank_warning",
      "title": "Отмена после предупреждения",
      "description": "Пользователь проверяет детали и отменяет перевод — безопасный исход",
      "simulatorType": "banking",
      "riskLevel": "low",
      "targetProfileIds": ["confident_digital_user", "normal_user"],
      "steps": ["home", "transfer", "review", "warning", "result"],
      "warningsEnabled": true,
      "warningKeys": ["bank.verify_details"],
      "expectedRiskFlags": ["cancelled_after_warning", "reviewed_details_before_confirm"]
    },
    {
      "id": "wallet_blind_signing",
      "title": "Подпись без просмотра деталей",
      "description": "Подтверждение подписи без раскрытия деталей операции",
      "simulatorType": "wallet",
      "riskLevel": "high",
      "targetProfileIds": ["wallet_power_user", "confident_digital_user"],
      "steps": ["wallet_home", "assets", "connect_service", "sign_operation", "result"],
      "warningsEnabled": true,
      "warningKeys": ["wallet.approval_access"],
      "expectedRiskFlags": ["signed_without_review", "fast_confirmation_under_pressure"]
    },
    {
      "id": "wallet_malicious_approval",
      "title": "Опасное разрешение на активы",
      "description": "Выдача широкого разрешения стороннему сервису после тревожного сигнала",
      "simulatorType": "wallet",
      "riskLevel": "high",
      "targetProfileIds": ["normal_user", "wallet_power_user"],
      "steps": ["wallet_home", "connect_service", "asset_approval", "warning", "result"],
      "warningsEnabled": true,
      "warningKeys": ["wallet.pressure_scam", "wallet.check_permissions"],
      "expectedRiskFlags": ["malicious_approval", "action_after_fake_alert", "ignored_warning"]
    },
    {
      "id": "wallet_fake_recovery_page",
      "title": "Секретная фраза на поддельной странице",
      "description": "Ввод секретной фразы на имитации страницы поддержки",
      "simulatorType": "wallet",
      "riskLevel": "high",
      "targetProfileIds": ["elderly_vulnerable_user", "normal_user"],
      "steps": ["wallet_home", "recovery_screen", "result"],
      "warningsEnabled": true,
      "warningKeys": ["wallet.no_recovery_on_unknown"],
      "expectedRiskFlags": ["recovery_phrase_entered", "action_after_fake_alert"]
    },
    {
      "id": "wallet_reject_after_warning",
      "title": "Отказ после предупреждения в кошельке",
      "description": "Пользователь проверяет детали и отклоняет опасное разрешение",
      "simulatorType": "wallet",
      "riskLevel": "low",
      "targetProfileIds": ["wallet_power_user", "confident_digital_user"],
      "steps": ["wallet_home", "connect_service", "asset_approval", "warning", "result"],
      "warningsEnabled": true,
      "warningKeys": ["wallet.check_permissions"],
      "expectedRiskFlags": ["reviewed_details_before_confirm", "cancelled_after_warning"]
    }
  ]
}
```
