# Banking Simulator MVP — accepted scope

## In scope

- Route `/banking/:scenarioId` with active session guard
- 8 step screens: home, accounts, transfer, new_recipient, review, warning, confirm, result
- 4 banking scenarios from `mockScenarios` (step paths from `scenario.steps`)
- Flow state: `bankingFlowStore` (form, resultType, warningAcknowledged)
- Telemetry: `screen_view`, `button_click`, `input_change`, `warning_view`, `warning_dismiss`, `confirm`, `cancel` + foundation `scenario_start` / `scenario_exit`
- `screenId` only from `src/config/screens.ts` (`BANKING_SCREEN_IDS`)
- Field ids for `input_change` from `src/config/bankingFields.ts`
- UI copy from `src/content/ru.ts`, mock data only
- Session end via `useBankingSessionActions` only (`endSession`, no duplicate `clearActiveSession`)

## Out of scope (next phases)

- Wallet simulator flow
- Risk engine / scoring / flags in summary
- Replay, dashboard, export
- Deep-link session bootstrap
- Extended summary metrics
