import { EMPTY_RISK_ASSESSMENT } from '../../types/risk'
import type { RiskAssessment } from '../../types/risk'
import type { SessionRecord, SessionSummary, TelemetryEventCounts } from '../../types/contracts'
import type { TelemetryEvent, TelemetryEventType } from '../../types/telemetry'
import { computeSessionBehavioralMetrics } from './sessionMetrics'

const EVENT_TYPES: TelemetryEventType[] = [
  'scenario_start',
  'screen_view',
  'button_click',
  'scenario_exit',
  'input_change',
  'warning_view',
  'warning_dismiss',
  'confirm',
  'cancel',
  'signature_approve',
  'signature_reject',
  'recovery_input',
]

function emptyEventCounts(): TelemetryEventCounts {
  return Object.fromEntries(EVENT_TYPES.map((t) => [t, 0])) as TelemetryEventCounts
}

/**
 * Foundation summary (behavioral + telemetry). Risk-поля — placeholder до engine.
 */
export function computeSessionSummary(
  record: SessionRecord,
  events: TelemetryEvent[],
  risk: RiskAssessment = EMPTY_RISK_ASSESSMENT,
): SessionSummary {
  const now = Date.now()
  const isEnded = record.status === 'ended'
  const endedAt = isEnded ? record.endedAt : null
  const startedAt = record.startedAt
  const totalDurationMs = isEnded
    ? Math.max(0, (endedAt ?? now) - startedAt)
    : Math.max(0, now - startedAt)

  const eventCounts = emptyEventCounts()
  for (const event of events) {
    eventCounts[event.eventType] += 1
  }

  const screenViewIds = events
    .filter((e) => e.eventType === 'screen_view')
    .map((e) => e.screenId)

  const behavioral = computeSessionBehavioralMetrics(events)

  return {
    sessionId: record.sessionId,
    scenarioId: record.scenarioId,
    profileId: record.profileId,
    status: record.status,
    startedAt,
    endedAt,
    totalDurationMs,
    screensVisited: new Set(screenViewIds).size,
    totalEvents: events.length,
    eventCounts,
    ...behavioral,
    riskScore: risk.riskScore,
    riskLevel: risk.riskLevel,
    riskFlags: [...risk.riskFlags],
  }
}

export { EVENT_TYPES }
