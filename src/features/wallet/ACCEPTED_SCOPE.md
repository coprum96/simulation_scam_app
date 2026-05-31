# Wallet Simulator MVP — accepted scope

## In scope

- Route `/wallet/:scenarioId` with active session guard
- 7 UI screens + result: wallet_home, assets, connect_service, sign_operation, asset_approval, warning, recovery_screen, result
- 4 wallet scenarios from `mockScenarios`
- Flow state: `walletFlowStore`
- Telemetry: foundation + wallet events (see types/telemetry.ts)
- `screenId` from `WALLET_SCREEN_IDS` in `src/config/screens.ts`
- Copy from `src/content/ru.ts`, mock assets/dapps only
- Session via `useWalletSessionActions` (`endSession` only, no `clearActiveSession` in flow)

## Out of scope

- Risk engine / scoring in summary or UI
- Replay, dashboard, export
- Banking changes
- Deep-link session bootstrap
