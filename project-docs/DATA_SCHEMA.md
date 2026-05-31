# Схемы данных

## UserProfile

```ts
type UserProfile = {
  id: string;
  name: string;
  description: string;
  digitalConfidence: "low" | "medium" | "high";
  fraudAwareness: "low" | "medium" | "high";
  readingDepth: "low" | "medium" | "high";
  warningSensitivity: "low" | "medium" | "high";
  reactionSpeed: "slow" | "normal" | "fast";
};
```

## Scenario

```ts
type Scenario = {
  id: string;
  title: string;
  description: string;
  simulatorType: "banking" | "wallet";
  riskLevel: "low" | "medium" | "high";
  targetProfileIds: string[];
  steps: string[];
  warningsEnabled: boolean;
  expectedRiskFlags: string[];
};
```

## TelemetryEvent

```ts
type TelemetryEvent = {
  id: string;
  sessionId: string;
  scenarioId: string;
  simulatorType: "banking" | "wallet";
  profileId: string;
  screenId: string;
  eventType:
    | "screen_view"
    | "button_click"
    | "input_change"
    | "warning_view"
    | "warning_dismiss"
    | "confirm"
    | "cancel"
    | "navigate_back"
    | "submit"
    | "signature_approve"
    | "signature_reject"
    | "recovery_input";
  timestamp: number;
  meta?: Record<string, any>;
};
```

## SessionSummary

```ts
type SessionSummary = {
  sessionId: string;
  scenarioId: string;
  profileId: string;
  startedAt: number;
  endedAt: number;
  totalDurationMs: number;
  screensVisited: number;
  warningsSeen: number;
  warningsIgnored: number;
  backNavigationCount: number;
  fieldEditCount: number;
  confirmationDelayMs: number;
  riskFlags: string[];
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  outcome: "safe" | "risky" | "stopped" | "escalated";
};
```

## Пример UserProfile

```json
{
  "id": "elderly_vulnerable_user",
  "name": "Пожилой уязвимый пользователь",
  "description": "Пользователь с низкой цифровой уверенностью и высокой внушаемостью",
  "digitalConfidence": "low",
  "fraudAwareness": "low",
  "readingDepth": "low",
  "warningSensitivity": "medium",
  "reactionSpeed": "slow"
}
```

## Пример Scenario

```json
{
  "id": "urgent_safe_account_transfer",
  "title": "Срочный перевод на «безопасный счёт»",
  "description": "Пользователь действует под давлением и переводит деньги новому получателю",
  "simulatorType": "banking",
  "riskLevel": "high",
  "targetProfileIds": ["normal_user", "elderly_vulnerable_user"],
  "steps": [
    "home",
    "transfer",
    "new_recipient",
    "review",
    "warning",
    "confirm",
    "result"
  ],
  "warningsEnabled": true,
  "expectedRiskFlags": [
    "ignored_warning",
    "new_recipient_high_amount",
    "fast_confirmation_under_pressure"
  ]
}
```