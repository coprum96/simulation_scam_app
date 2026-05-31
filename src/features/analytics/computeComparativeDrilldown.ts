import type { Session } from '../../types/contracts'
import { sessionRiskLevel, sessionRiskScore } from '../dashboard/dashboardFilters'
import type { ComparativeDrilldownMode, ComparativeDrilldownResult, ComparativeSideMetrics } from './drilldownTypes'

function toPercent(count: number, total: number): number {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

function averageRounded(values: number[]): number {
  const finite = values.filter((n) => Number.isFinite(n))
  if (finite.length === 0) return 0
  return Math.round(finite.reduce((acc, n) => acc + n, 0) / finite.length)
}

function sessionDurationMs(session: Session): number {
  const fromSummary = session.summary?.totalDurationMs
  if (fromSummary != null && Number.isFinite(fromSummary)) return fromSummary
  const end = session.record.endedAt
  const start = session.record.startedAt
  if (end != null && start != null && end >= start) return end - start
  return 0
}

function metricsForGroup(sessions: Session[], label: string): ComparativeSideMetrics {
  const total = sessions.length
  const completed = sessions.filter((s) => s.record.outcome === 'completed').length
  const stopped = sessions.filter((s) => s.record.outcome === 'stopped').length
  const abandoned = sessions.filter((s) => s.record.outcome === 'abandoned').length
  const highRisk = sessions.filter((s) => sessionRiskLevel(s) === 'high').length

  return {
    label,
    sessions: total,
    completedRate: toPercent(completed, total),
    stoppedRate: toPercent(stopped, total),
    abandonedRate: toPercent(abandoned, total),
    avgRiskScore: averageRounded(sessions.map(sessionRiskScore)),
    highRiskPercent: toPercent(highRisk, total),
    avgDurationMs: averageRounded(sessions.map(sessionDurationMs)),
  }
}

function splitByMedianTime(sessions: Session[]): { a: Session[]; b: Session[] } {
  if (sessions.length < 2) return { a: sessions, b: [] }
  const sorted = [...sessions].sort(
    (x, y) => (x.record.endedAt ?? 0) - (y.record.endedAt ?? 0),
  )
  const mid = Math.floor(sorted.length / 2)
  return { a: sorted.slice(0, mid), b: sorted.slice(mid) }
}

function filterBySimulator(sessions: Session[], simulator: string): Session[] {
  return sessions.filter((s) => s.record.simulatorType === simulator)
}

function filterByScenario(sessions: Session[], scenarioId: string): Session[] {
  return sessions.filter((s) => s.record.scenarioId === scenarioId)
}

function emptySide(label: string): ComparativeSideMetrics {
  return {
    label,
    sessions: 0,
    completedRate: 0,
    stoppedRate: 0,
    abandonedRate: 0,
    avgRiskScore: 0,
    highRiskPercent: 0,
    avgDurationMs: 0,
  }
}

export function computeComparativeDrilldown(
  sessions: Session[],
  mode: ComparativeDrilldownMode,
  sideAKey: string | undefined,
  sideBKey: string | undefined,
): ComparativeDrilldownResult | null {
  if (sessions.length === 0) return null

  let sideA: ComparativeSideMetrics
  let sideB: ComparativeSideMetrics

  if (mode === 'scenario') {
    const scenarioIds = [...new Set(sessions.map((s) => s.record.scenarioId))].sort()
    const aId = sideAKey && scenarioIds.includes(sideAKey) ? sideAKey : scenarioIds[0]
    const bId =
      sideBKey && scenarioIds.includes(sideBKey) && sideBKey !== aId
        ? sideBKey
        : scenarioIds.find((id) => id !== aId)
    if (!aId || !bId) return null
    sideA = metricsForGroup(filterByScenario(sessions, aId), aId)
    sideB = metricsForGroup(filterByScenario(sessions, bId), bId)
  } else if (mode === 'simulator') {
    const simulators = [...new Set(sessions.map((s) => s.record.simulatorType))].sort()
    const aSim = sideAKey && simulators.includes(sideAKey as 'banking' | 'wallet') ? sideAKey : simulators[0]
    const bSim =
      sideBKey && simulators.includes(sideBKey as 'banking' | 'wallet') && sideBKey !== aSim
        ? sideBKey
        : simulators.find((s) => s !== aSim)
    if (!aSim || !bSim) return null
    sideA = metricsForGroup(filterBySimulator(sessions, aSim), aSim)
    sideB = metricsForGroup(filterBySimulator(sessions, bSim), bSim)
  } else {
    const { a, b } = splitByMedianTime(sessions)
    if (b.length === 0) return null
    sideA = metricsForGroup(a, sideAKey ?? 'prior')
    sideB = metricsForGroup(b, sideBKey ?? 'recent')
  }

  if (sideA.sessions === 0 && sideB.sessions === 0) return null

  return {
    mode,
    sideA: sideA.sessions > 0 ? sideA : emptySide(sideA.label),
    sideB: sideB.sessions > 0 ? sideB : emptySide(sideB.label),
    deltas: {
      completedRate: sideB.completedRate - sideA.completedRate,
      avgRiskScore: sideB.avgRiskScore - sideA.avgRiskScore,
      highRiskPercent: sideB.highRiskPercent - sideA.highRiskPercent,
      abandonedRate: sideB.abandonedRate - sideA.abandonedRate,
    },
  }
}

export function listComparativeOptions(
  sessions: Session[],
  mode: ComparativeDrilldownMode,
): string[] {
  if (mode === 'scenario') {
    return [...new Set(sessions.map((s) => s.record.scenarioId))].sort()
  }
  if (mode === 'simulator') {
    return [...new Set(sessions.map((s) => s.record.simulatorType))].sort()
  }
  return ['prior', 'recent']
}
