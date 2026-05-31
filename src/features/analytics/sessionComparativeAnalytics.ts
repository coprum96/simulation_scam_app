import type { Session } from '../../types/contracts'
import { sessionRiskScore } from '../dashboard/dashboardFilters'

type CountRow = {
  key: string
  count: number
}

type GroupRow = {
  key: string
  sessions: number
  averageRiskScore: number
  completed: number
  stopped: number
  abandoned: number
}

export type ComparativeAnalytics = {
  outcomes: {
    completed: number
    stopped: number
    abandoned: number
  }
  averages: {
    riskScore: number
    durationMs: number
  }
  warningBehavior: {
    totalSeen: number
    totalIgnored: number
    ignoredRatePercent: number
    mostIgnoredWarnings: CountRow[]
  }
  flagComparison: {
    matchedExpectedTotal: number
    missedExpectedTotal: number
    unexpectedTotal: number
    mostMatchedExpected: CountRow[]
    mostMissedExpected: CountRow[]
    mostUnexpected: CountRow[]
  }
  patterns: {
    sessionsWithConfirm: number
    sessionsWithCancel: number
    sessionsWithBoth: number
    mostCommonAbandonPoints: CountRow[]
  }
  comparisons: {
    byScenario: GroupRow[]
    byProfile: GroupRow[]
    bySimulator: GroupRow[]
  }
}

function averageRounded(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((acc, value) => acc + value, 0) / values.length)
}

function topRows(counter: Map<string, number>, limit = 5): CountRow[] {
  return [...counter.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

function addCount(counter: Map<string, number>, key: string): void {
  counter.set(key, (counter.get(key) ?? 0) + 1)
}

function buildGroupRows(sessions: Session[], selectKey: (session: Session) => string): GroupRow[] {
  const buckets = new Map<string, Session[]>()
  for (const session of sessions) {
    const key = selectKey(session)
    const current = buckets.get(key) ?? []
    current.push(session)
    buckets.set(key, current)
  }

  return [...buckets.entries()]
    .map(([key, group]) => {
      const completed = group.filter((s) => s.record.outcome === 'completed').length
      const stopped = group.filter((s) => s.record.outcome === 'stopped').length
      const abandoned = group.filter((s) => s.record.outcome === 'abandoned').length
      const averageRiskScore = averageRounded(group.map(sessionRiskScore))
      return {
        key,
        sessions: group.length,
        averageRiskScore,
        completed,
        stopped,
        abandoned,
      }
    })
    .sort((a, b) => b.sessions - a.sessions)
}

export function computeComparativeAnalytics(sessions: Session[]): ComparativeAnalytics {
  const completed = sessions.filter((s) => s.record.outcome === 'completed').length
  const stopped = sessions.filter((s) => s.record.outcome === 'stopped').length
  const abandoned = sessions.filter((s) => s.record.outcome === 'abandoned').length

  const averages = {
    riskScore: averageRounded(sessions.map(sessionRiskScore)),
    durationMs: averageRounded(sessions.map((s) => s.summary?.totalDurationMs ?? 0)),
  }

  const warningSeenTotal = sessions.reduce((acc, s) => acc + s.summary.warningsSeen, 0)
  const warningIgnoredTotal = sessions.reduce((acc, s) => acc + s.summary.warningsIgnored, 0)
  const ignoredRatePercent =
    warningSeenTotal > 0 ? Math.round((warningIgnoredTotal / warningSeenTotal) * 100) : 0

  const ignoredWarningsCounter = new Map<string, number>()
  const abandonPointsCounter = new Map<string, number>()
  const matchedCounter = new Map<string, number>()
  const missedCounter = new Map<string, number>()
  const unexpectedCounter = new Map<string, number>()

  let sessionsWithConfirm = 0
  let sessionsWithCancel = 0
  let sessionsWithBoth = 0

  for (const session of sessions) {
    const hasConfirm = session.events.some(
      (e) => e.eventType === 'confirm' || e.eventType === 'signature_approve',
    )
    const hasCancel = session.events.some(
      (e) => e.eventType === 'cancel' || e.eventType === 'signature_reject',
    )
    if (hasConfirm) sessionsWithConfirm += 1
    if (hasCancel) sessionsWithCancel += 1
    if (hasConfirm && hasCancel) sessionsWithBoth += 1

    for (const event of session.events) {
      if (event.eventType !== 'warning_dismiss') continue
      const dismissType = String(event.meta?.dismissType ?? '')
      if (dismissType !== 'continued' && dismissType !== 'bypassed') continue
      const keys = Array.isArray(event.meta?.warningKeys)
        ? (event.meta?.warningKeys as unknown[]).filter((key): key is string => typeof key === 'string')
        : []
      if (keys.length === 0) {
        addCount(ignoredWarningsCounter, event.screenId)
      } else {
        for (const key of keys) addCount(ignoredWarningsCounter, key)
      }
    }

    if (session.record.outcome === 'abandoned') {
      const exitEvent = [...session.events]
        .reverse()
        .find((event) => event.eventType === 'scenario_exit')
      addCount(abandonPointsCounter, exitEvent?.screenId ?? 'unknown')
    }

    const expected = session.riskReport?.expectedRiskFlags ?? []
    const missed = new Set(session.riskReport?.missedExpectedFlags ?? [])
    const unexpected = session.riskReport?.unexpectedFlags ?? []
    for (const flag of expected) {
      if (missed.has(flag)) {
        addCount(missedCounter, flag)
      } else {
        addCount(matchedCounter, flag)
      }
    }
    for (const flag of unexpected) addCount(unexpectedCounter, flag)
  }

  return {
    outcomes: { completed, stopped, abandoned },
    averages,
    warningBehavior: {
      totalSeen: warningSeenTotal,
      totalIgnored: warningIgnoredTotal,
      ignoredRatePercent,
      mostIgnoredWarnings: topRows(ignoredWarningsCounter),
    },
    flagComparison: {
      matchedExpectedTotal: [...matchedCounter.values()].reduce((acc, n) => acc + n, 0),
      missedExpectedTotal: [...missedCounter.values()].reduce((acc, n) => acc + n, 0),
      unexpectedTotal: [...unexpectedCounter.values()].reduce((acc, n) => acc + n, 0),
      mostMatchedExpected: topRows(matchedCounter),
      mostMissedExpected: topRows(missedCounter),
      mostUnexpected: topRows(unexpectedCounter),
    },
    patterns: {
      sessionsWithConfirm,
      sessionsWithCancel,
      sessionsWithBoth,
      mostCommonAbandonPoints: topRows(abandonPointsCounter),
    },
    comparisons: {
      byScenario: buildGroupRows(sessions, (s) => s.record.scenarioId),
      byProfile: buildGroupRows(sessions, (s) => s.record.profileId),
      bySimulator: buildGroupRows(sessions, (s) => s.record.simulatorType),
    },
  }
}

