import type { SimulatorType } from './scenario'

/** Foundation + banking + wallet flow MVP */
export type TelemetryEventType =
  | 'scenario_start'
  | 'screen_view'
  | 'button_click'
  | 'scenario_exit'
  | 'input_change'
  | 'warning_view'
  | 'warning_dismiss'
  | 'confirm'
  | 'cancel'
  | 'signature_approve'
  | 'signature_reject'
  | 'recovery_input'

export type TelemetryEvent = {
  id: string
  sessionId: string
  scenarioId: string
  simulatorType: SimulatorType
  profileId: string
  screenId: string
  eventType: TelemetryEventType
  timestamp: number
  meta?: Record<string, unknown>
}

export type LogEventInput = {
  eventType: TelemetryEventType
  screenId: string
  meta?: Record<string, unknown>
}
