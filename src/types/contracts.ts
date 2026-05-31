/**
 * Canonical session / flow contracts.
 * Risk types — в `./risk.ts`.
 *
 * @see project-docs/SESSION_CONTRACT.md
 */

import type { RiskLevel, SessionRiskReport } from './risk'
import { EMPTY_RISK_ASSESSMENT } from './risk'
import type { SimulatorType } from './scenario'
import type { TelemetryEvent, TelemetryEventType } from './telemetry'

export type { RiskAssessment, RiskLevel, RiskFlagId, SessionRiskReport } from './risk'
export { RISK_LEVELS, RISK_FLAG_IDS, EMPTY_RISK_ASSESSMENT } from './risk'

// —— Lifecycle ——
export const SESSION_STATUSES = ['active', 'ended'] as const
export type SessionStatus = (typeof SESSION_STATUSES)[number]

export const SESSION_OUTCOMES = ['completed', 'stopped', 'abandoned'] as const
export type SessionOutcome = (typeof SESSION_OUTCOMES)[number]

// —— Flow UX result (не SessionOutcome; не safe/risky) ——
export const FLOW_RESULT_TYPES = ['confirmed', 'cancelled', 'rejected', 'escalated'] as const
export type FlowResultType = (typeof FLOW_RESULT_TYPES)[number]

// —— Telemetry meta (canonical) ——
export const WARNING_DISMISS_TYPES = ['continued', 'cancelled', 'bypassed'] as const
export type WarningDismissType = (typeof WARNING_DISMISS_TYPES)[number]

export const SCENARIO_EXIT_REASONS = [
  'scenario_finished',
  'back_to_hub',
  'replaced_by_new_session',
  'user_exit',
] as const
export type ScenarioExitReason = (typeof SCENARIO_EXIT_REASONS)[number]

// —— Session domain ——
export type SessionRecord = {
  sessionId: string
  scenarioId: string
  profileId: string
  simulatorType: SimulatorType
  startedAt: number
  endedAt: number | null
  status: SessionStatus
  outcome: SessionOutcome | null
  /** null пока session active; заполняет Risk Engine при end */
  riskScore: number | null
  riskLevel: RiskLevel | null
  riskFlags: string[] | null
}

export type TelemetryEventCounts = Record<TelemetryEventType, number>

/** Поведенческие агрегаты (из events, без risk-логики) */
export type SessionBehavioralMetrics = {
  warningsSeen: number
  warningsIgnored: number
  fieldEditCount: number
  backNavigationCount: number
  confirmationDelayMs: number | null
}

/** Foundation + risk (risk на ended — из engine) */
export type SessionSummary = {
  sessionId: string
  scenarioId: string
  profileId: string
  status: SessionStatus
  startedAt: number
  endedAt: number | null
  totalDurationMs: number
  screensVisited: number
  totalEvents: number
  eventCounts: TelemetryEventCounts
  warningsSeen: number
  warningsIgnored: number
  fieldEditCount: number
  backNavigationCount: number
  confirmationDelayMs: number | null
  riskScore: number
  riskLevel: RiskLevel
  riskFlags: string[]
}

export type SessionSummaryFoundation = Omit<
  SessionSummary,
  'riskScore' | 'riskLevel' | 'riskFlags'
>

/**
 * Полная сессия в памяти: lifecycle + raw events + summary (включая risk после engine).
 */
export type Session = {
  record: SessionRecord
  events: TelemetryEvent[]
  summary: SessionSummary
  /** null для active; заполняется Risk Engine при end */
  riskReport: SessionRiskReport | null
}

export { EMPTY_RISK_ASSESSMENT as EMPTY_RISK }
