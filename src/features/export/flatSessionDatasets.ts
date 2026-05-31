import type { Session } from '../../types/contracts'
import type { ExportMetadata } from './exportSchema'

export type SessionLevelRow = ExportMetadata & {
  sessionId: string
  scenarioId: string
  profileId: string
  simulatorType: string
  status: string
  outcome: string
  startedAt: number
  endedAt: number | null
  totalEvents: number
}

export type SummaryLevelRow = ExportMetadata & {
  sessionId: string
  totalDurationMs: number
  screensVisited: number
  warningsSeen: number
  warningsIgnored: number
  fieldEditCount: number
  backNavigationCount: number
  confirmationDelayMs: number | null
  eventCountsJson: string
}

export type RiskLevelRow = ExportMetadata & {
  sessionId: string
  riskScore: number
  riskLevel: string
  riskFlagsJson: string
  expectedRiskFlagsJson: string
  missedExpectedFlagsJson: string
  unexpectedFlagsJson: string
  ruleHitsJson: string
}

export type FlatSessionDatasets = {
  sessionLevel: SessionLevelRow[]
  summaryLevel: SummaryLevelRow[]
  riskLevel: RiskLevelRow[]
}

export function buildFlatSessionDatasets(
  sessions: Session[],
  metadata: ExportMetadata,
): FlatSessionDatasets {
  return {
    sessionLevel: sessions.map((session) => ({
      ...metadata,
      sessionId: session.record.sessionId,
      scenarioId: session.record.scenarioId,
      profileId: session.record.profileId,
      simulatorType: session.record.simulatorType,
      status: session.record.status,
      outcome: session.record.outcome ?? '',
      startedAt: session.record.startedAt,
      endedAt: session.record.endedAt,
      totalEvents: session.summary.totalEvents,
    })),
    summaryLevel: sessions.map((session) => ({
      ...metadata,
      sessionId: session.record.sessionId,
      totalDurationMs: session.summary.totalDurationMs,
      screensVisited: session.summary.screensVisited,
      warningsSeen: session.summary.warningsSeen,
      warningsIgnored: session.summary.warningsIgnored,
      fieldEditCount: session.summary.fieldEditCount,
      backNavigationCount: session.summary.backNavigationCount,
      confirmationDelayMs: session.summary.confirmationDelayMs,
      eventCountsJson: JSON.stringify(session.summary.eventCounts),
    })),
    riskLevel: sessions.map((session) => ({
      ...metadata,
      sessionId: session.record.sessionId,
      riskScore: session.record.riskScore ?? session.summary.riskScore,
      riskLevel: session.record.riskLevel ?? session.summary.riskLevel,
      riskFlagsJson: JSON.stringify(session.record.riskFlags ?? session.summary.riskFlags),
      expectedRiskFlagsJson: JSON.stringify(session.riskReport?.expectedRiskFlags ?? []),
      missedExpectedFlagsJson: JSON.stringify(session.riskReport?.missedExpectedFlags ?? []),
      unexpectedFlagsJson: JSON.stringify(session.riskReport?.unexpectedFlags ?? []),
      ruleHitsJson: JSON.stringify(session.riskReport?.assessment?.ruleHits ?? []),
    })),
  }
}

