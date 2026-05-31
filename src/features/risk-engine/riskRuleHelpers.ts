import { RISK_SCENARIO_IDS } from '../../config'
import type { SessionRecord } from '../../types/contracts'
import type { Scenario } from '../../types/scenario'
import type { TelemetryEvent } from '../../types/telemetry'

export function visitedScreen(events: TelemetryEvent[], screenId: string): boolean {
  return events.some((e) => e.eventType === 'screen_view' && e.screenId === screenId)
}

export function hasDismissType(events: TelemetryEvent[], dismissType: string): boolean {
  return events.some(
    (e) => e.eventType === 'warning_dismiss' && e.meta?.dismissType === dismissType,
  )
}

export function hasEventAfterWarning(
  events: TelemetryEvent[],
  predicate: (e: TelemetryEvent) => boolean,
): boolean {
  const lastWarningAt = events
    .filter((e) => e.eventType === 'warning_view')
    .map((e) => e.timestamp)
    .at(-1)
  if (lastWarningAt === undefined) return false
  return events.some((e) => e.timestamp > lastWarningAt && predicate(e))
}

export function catalogRiskIsElevated(scenario: Scenario): boolean {
  return scenario.riskLevel === 'medium' || scenario.riskLevel === 'high'
}

export function isMaliciousApprovalScenario(scenario: Scenario): boolean {
  return scenario.id === RISK_SCENARIO_IDS.walletMaliciousApproval
}

export function userConfirmedAction(events: TelemetryEvent[], record: SessionRecord): boolean {
  return (
    record.outcome === 'completed' &&
    events.some((e) => e.eventType === 'confirm' || e.eventType === 'signature_approve')
  )
}
