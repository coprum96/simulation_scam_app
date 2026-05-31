import type { SessionBehavioralMetrics } from '../../types/contracts'
import type { TelemetryEvent } from '../../types/telemetry'

const IGNORED_DISMISS_TYPES = new Set(['continued', 'bypassed'])

export function computeSessionBehavioralMetrics(events: TelemetryEvent[]): SessionBehavioralMetrics {
  let warningsSeen = 0
  let warningsIgnored = 0
  let fieldEditCount = 0
  let backNavigationCount = 0

  for (const event of events) {
    if (event.eventType === 'warning_view') warningsSeen += 1
    if (event.eventType === 'warning_dismiss') {
      const dismissType = String(event.meta?.dismissType ?? '')
      if (IGNORED_DISMISS_TYPES.has(dismissType)) warningsIgnored += 1
    }
    if (event.eventType === 'input_change' && event.meta?.commit === true) {
      fieldEditCount += 1
    }
    if (
      event.eventType === 'button_click' &&
      event.meta?.buttonId === 'navigate_back'
    ) {
      backNavigationCount += 1
    }
  }

  const confirmationDelayMs = computeConfirmationDelayMs(events)

  return {
    warningsSeen,
    warningsIgnored,
    fieldEditCount,
    backNavigationCount,
    confirmationDelayMs,
  }
}

function computeConfirmationDelayMs(events: TelemetryEvent[]): number | null {
  const warningViews = events.filter((e) => e.eventType === 'warning_view')
  const lastWarning = warningViews.at(-1)

  const confirmEvent = events.find(
    (e) => e.eventType === 'confirm' || e.eventType === 'signature_approve',
  )
  if (!confirmEvent) return null

  const anchor = lastWarning ?? events.find((e) => e.eventType === 'scenario_start')
  if (!anchor) return null

  return Math.max(0, confirmEvent.timestamp - anchor.timestamp)
}
