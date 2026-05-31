/**
 * Phase 3E.1 analytics stabilization checks.
 * Run: npm run check:phase3e1
 */
import { EMPTY_RISK_ASSESSMENT } from '../src/types/risk'
import type { Session, SessionSummary } from '../src/types/contracts'
import { computeSessionAnalytics } from '../src/features/analytics/computeSessionAnalytics'
import {
  DEFAULT_ANALYTICS_FILTERS,
  filterAnalyticsSessions,
} from '../src/features/analytics/analyticsFilters'
import { sessionRiskLevel, sessionRiskScore } from '../src/features/dashboard/dashboardFilters'

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

const BASE_SUMMARY: Omit<SessionSummary, 'sessionId' | 'scenarioId' | 'riskScore' | 'riskLevel' | 'riskFlags'> = {
  profileId: 'normal_user',
  status: 'ended',
  startedAt: 0,
  endedAt: 0,
  totalDurationMs: 60_000,
  screensVisited: 3,
  totalEvents: 5,
  eventCounts: {
    scenario_start: 1,
    screen_view: 2,
    button_click: 1,
    scenario_exit: 1,
    input_change: 0,
    warning_view: 0,
    warning_dismiss: 0,
    confirm: 0,
    cancel: 0,
    signature_approve: 0,
    signature_reject: 0,
    recovery_input: 0,
  },
  warningsSeen: 0,
  warningsIgnored: 0,
  fieldEditCount: 0,
  backNavigationCount: 0,
  confirmationDelayMs: null,
}

function makeSession(partial: {
  sessionId: string
  scenarioId: string
  outcome: 'completed' | 'stopped' | 'abandoned' | null
  riskScore?: number | null
  riskLevel?: 'low' | 'medium' | 'high' | null
  ruleId?: string
  delta?: number
  simulatorType?: 'banking' | 'wallet'
  profileId?: string
  endedAt?: number | null
  totalDurationMs?: number
  omitRecordRisk?: boolean
  omitSummaryRisk?: boolean
  omitFlags?: boolean
  omitRuleHits?: boolean
}): Session {
  const now = partial.endedAt ?? Date.now()
  const riskScore = partial.riskScore ?? 20
  const riskLevel = partial.riskLevel ?? 'low'
  const flags = partial.omitFlags ? [] : partial.ruleId ? [partial.ruleId] : []

  return {
    record: {
      sessionId: partial.sessionId,
      scenarioId: partial.scenarioId,
      profileId: partial.profileId ?? 'normal_user',
      simulatorType: partial.simulatorType ?? 'banking',
      startedAt: now - 60_000,
      endedAt: partial.endedAt === undefined ? now : partial.endedAt,
      status: 'ended',
      outcome: partial.outcome,
      riskScore: partial.omitRecordRisk ? null : riskScore,
      riskLevel: partial.omitRecordRisk ? null : riskLevel,
      riskFlags: partial.omitFlags ? null : flags,
    },
    events: [],
    summary: {
      ...BASE_SUMMARY,
      sessionId: partial.sessionId,
      scenarioId: partial.scenarioId,
      startedAt: now - 60_000,
      endedAt: partial.endedAt === undefined ? now : partial.endedAt,
      totalDurationMs: partial.totalDurationMs ?? 60_000,
      riskScore: partial.omitSummaryRisk ? (0 as never) : (riskScore as number),
      riskLevel: partial.omitSummaryRisk ? ('low' as never) : riskLevel,
      riskFlags: partial.omitFlags ? [] : flags,
    },
    riskReport:
      partial.omitRuleHits || !partial.ruleId
        ? null
        : {
            sessionId: partial.sessionId,
            scenarioId: partial.scenarioId,
            simulatorType: partial.simulatorType ?? 'banking',
            catalogRiskLevel: 'medium',
            expectedRiskFlags: [partial.ruleId],
            missedExpectedFlags: [],
            unexpectedFlags: [],
            assessment: {
              ...EMPTY_RISK_ASSESSMENT,
              riskScore: riskScore as number,
              riskLevel: riskLevel as 'low' | 'medium' | 'high',
              riskFlags: [partial.ruleId as never],
              ruleHits: [{ ruleId: partial.ruleId as never, delta: partial.delta ?? 10 }],
              reasons: [partial.ruleId as never],
            },
            evaluatedAt: now,
          },
  }
}

function assertSummaryConsistency(summary: ReturnType<typeof computeSessionAnalytics>, sessions: Session[]): void {
  const n = sessions.length
  assert(summary.meta.filteredSessions === n, 'meta.filteredSessions matches input')

  const outcomeSum =
    summary.outcomeRates.completed + summary.outcomeRates.stopped + summary.outcomeRates.abandoned
  assert(outcomeSum <= n, 'outcome counts do not exceed session count')

  const distributionSum = summary.outcomeDistribution.reduce((acc, row) => acc + row.count, 0)
  assert(distributionSum === outcomeSum, 'outcomeDistribution counts match outcomeRates')

  const riskLevelSum = summary.riskLevelDistribution.reduce((acc, row) => acc + row.count, 0)
  assert(riskLevelSum === n, 'riskLevelDistribution sums to filtered count')

  const highFromDistribution = summary.riskLevelDistribution.find((r) => r.key === 'high')?.count ?? 0
  assert(
    summary.highRiskSessions.length <= highFromDistribution,
    'highRiskSessions length <= high risk distribution count',
  )
  for (const row of summary.highRiskSessions) {
    assert(row.riskLevel === 'high', 'highRiskSessions rows are high risk')
  }

  const scenarioSessionsSum = summary.scenarioComparison.reduce((acc, row) => acc + row.sessions, 0)
  assert(scenarioSessionsSum === n, 'scenarioComparison sessions sum matches filtered count')

  const byScenarioSum = summary.sessionsByScenario.reduce((acc, row) => acc + row.count, 0)
  assert(byScenarioSum <= n, 'sessionsByScenario counts do not exceed filtered count')

  const outcomeByRiskSum = summary.outcomeByRiskLevel.reduce((acc, row) => acc + row.sessions, 0)
  assert(outcomeByRiskSum === n, 'outcomeByRiskLevel sessions sum matches filtered count')

  const completedByRisk = summary.outcomeByRiskLevel.reduce(
    (acc, row) => acc + row.rates.completed,
    0,
  )
  assert(completedByRisk === summary.outcomeRates.completed, 'completed counts match across tables')

  const scoreBucketSum = summary.riskScoreDistribution.reduce((acc, row) => acc + row.count, 0)
  assert(scoreBucketSum === n, 'riskScoreDistribution sums to filtered count')

  assert(
    summary.comparative.outcomes.completed === summary.outcomeRates.completed,
    'comparative.completed matches outcomeRates',
  )
  assert(
    summary.comparative.outcomes.stopped === summary.outcomeRates.stopped,
    'comparative.stopped matches outcomeRates',
  )
  assert(
    summary.comparative.outcomes.abandoned === summary.outcomeRates.abandoned,
    'comparative.abandoned matches outcomeRates',
  )

  if (summary.topRiskFlags.length > 0) {
    const flagPercentSum = summary.topRiskFlags.reduce((acc, row) => acc + row.percent, 0)
    assert(flagPercentSum <= 100, 'topRiskFlags percents sum to at most 100')
  }
}

function testAggregation(): void {
  const sessions = [
    makeSession({
      sessionId: 's1',
      scenarioId: 'scenario_a',
      outcome: 'completed',
      riskScore: 20,
      riskLevel: 'low',
    }),
    makeSession({
      sessionId: 's2',
      scenarioId: 'scenario_a',
      outcome: 'abandoned',
      riskScore: 85,
      riskLevel: 'high',
      ruleId: 'ignored_warning',
      delta: 15,
    }),
    makeSession({
      sessionId: 's3',
      scenarioId: 'scenario_b',
      outcome: 'stopped',
      riskScore: 55,
      riskLevel: 'medium',
      ruleId: 'ignored_warning',
      delta: 12,
    }),
  ]

  const summary = computeSessionAnalytics(sessions, sessions.length)
  assert(summary.meta.filteredSessions === 3, 'filtered count')
  assert(summary.outcomeRates.completed === 1, 'completed count')
  assert(summary.outcomeRates.abandonedRate === 33, 'abandon rate rounded')
  assert(summary.sessionsByScenario.length === 2, 'scenario groups')
  assert(summary.ruleEffectiveness.length >= 1, 'rule effectiveness')
  assert(summary.highRiskSessions.length === 1, 'high risk row')
  assert(summary.scenarioComparison.length === 2, 'scenario comparison')
  assert(summary.riskScoreDistribution.some((b) => b.count > 0), 'score buckets')
  assertSummaryConsistency(summary, sessions)
}

function testEmptyStore(): void {
  const summary = computeSessionAnalytics([], 0)
  assert(summary.meta.filteredSessions === 0, 'empty filtered')
  assert(summary.meta.totalSessions === 0, 'empty total')
  assert(summary.outcomeRates.completed === 0, 'empty outcomes')
  assert(summary.highRiskSessions.length === 0, 'empty high risk')
}

function testSingleSession(): void {
  const sessions = [
    makeSession({
      sessionId: 'solo',
      scenarioId: 'scenario_a',
      outcome: 'completed',
      riskScore: 10,
      riskLevel: 'low',
    }),
  ]
  const summary = computeSessionAnalytics(sessions, 1)
  assert(summary.outcomeRates.completedRate === 100, 'single session completion rate')
  assertSummaryConsistency(summary, sessions)
}

function testNoFlagsNoRuleHits(): void {
  const sessions = [
    makeSession({
      sessionId: 'plain',
      scenarioId: 'scenario_a',
      outcome: 'stopped',
      riskScore: 30,
      riskLevel: 'low',
      omitFlags: true,
      omitRuleHits: true,
    }),
  ]
  const summary = computeSessionAnalytics(sessions, 1)
  assert(summary.topRiskFlags.length === 0, 'no flags')
  assert(summary.ruleEffectiveness.length === 0, 'no rules')
  assertSummaryConsistency(summary, sessions)
}

function testLegacyRiskFromReport(): void {
  const session = makeSession({
    sessionId: 'legacy',
    scenarioId: 'scenario_a',
    outcome: 'completed',
    riskScore: 72,
    riskLevel: 'high',
    omitRecordRisk: true,
    omitSummaryRisk: true,
    ruleId: 'ignored_warning',
  })
  session.summary.riskScore = undefined as never
  session.summary.riskLevel = undefined as never
  session.riskReport!.assessment.riskScore = 72
  session.riskReport!.assessment.riskLevel = 'high'

  assert(sessionRiskScore(session) === 72, 'legacy score from riskReport')
  assert(sessionRiskLevel(session) === 'high', 'legacy level from riskReport')

  const summary = computeSessionAnalytics([session], 1)
  assert(summary.riskLevelDistribution.find((r) => r.key === 'high')?.count === 1, 'legacy high risk')
  assertSummaryConsistency(summary, [session])
}

function testMissingEndedAtAndDuration(): void {
  const session = makeSession({
    sessionId: 'no-end',
    scenarioId: 'scenario_a',
    outcome: 'abandoned',
    riskScore: 40,
    riskLevel: 'medium',
    endedAt: null,
    totalDurationMs: Number.NaN,
    omitRuleHits: true,
  })
  const summary = computeSessionAnalytics([session], 1)
  assert(Number.isFinite(summary.avgDurationMs), 'avg duration finite when derived from timestamps')
  assertSummaryConsistency(summary, [session])
}

function testFilters(): void {
  const now = Date.UTC(2026, 4, 15, 12, 0, 0)
  const store: Record<string, Session> = {
    a: makeSession({
      sessionId: 'a',
      scenarioId: 'scenario_a',
      outcome: 'completed',
      riskScore: 10,
      riskLevel: 'low',
      simulatorType: 'banking',
      profileId: 'normal_user',
      endedAt: now,
    }),
    b: makeSession({
      sessionId: 'b',
      scenarioId: 'scenario_b',
      outcome: 'abandoned',
      riskScore: 90,
      riskLevel: 'high',
      simulatorType: 'wallet',
      profileId: 'risk_seeker',
      endedAt: now - 86_400_000,
      ruleId: 'ignored_warning',
    }),
  }

  const byScenario = filterAnalyticsSessions(store, {
    ...DEFAULT_ANALYTICS_FILTERS,
    scenarioId: 'scenario_a',
  })
  assert(byScenario.length === 1 && byScenario[0].record.sessionId === 'a', 'filter scenario')

  const bySimulator = filterAnalyticsSessions(store, {
    ...DEFAULT_ANALYTICS_FILTERS,
    simulatorType: 'wallet',
  })
  assert(bySimulator.length === 1 && bySimulator[0].record.sessionId === 'b', 'filter simulator')

  const byOutcome = filterAnalyticsSessions(store, {
    ...DEFAULT_ANALYTICS_FILTERS,
    outcome: 'abandoned',
  })
  assert(byOutcome.length === 1, 'filter outcome')

  const byRisk = filterAnalyticsSessions(store, {
    ...DEFAULT_ANALYTICS_FILTERS,
    riskLevel: 'high',
  })
  assert(byRisk.length === 1, 'filter risk level')

  const byProfile = filterAnalyticsSessions(store, {
    ...DEFAULT_ANALYTICS_FILTERS,
    profileId: 'risk_seeker',
  })
  assert(byProfile.length === 1, 'filter profile')

  const byDate = filterAnalyticsSessions(store, {
    ...DEFAULT_ANALYTICS_FILTERS,
    dateFrom: '2026-05-15',
    dateTo: '2026-05-15',
  })
  assert(byDate.length === 1 && byDate[0].record.sessionId === 'a', 'filter date range')

  const noEndedAtWithDate = filterAnalyticsSessions(
    { noEnd: makeSession({ sessionId: 'noEnd', scenarioId: 'scenario_a', outcome: 'stopped', endedAt: null }) },
    { ...DEFAULT_ANALYTICS_FILTERS, dateFrom: '2026-01-01' },
  )
  assert(noEndedAtWithDate.length === 0, 'missing endedAt excluded when date filter active')

  const noEndedAtNoDate = filterAnalyticsSessions(
    { noEnd: makeSession({ sessionId: 'noEnd2', scenarioId: 'scenario_a', outcome: 'stopped', endedAt: null }) },
    DEFAULT_ANALYTICS_FILTERS,
  )
  assert(noEndedAtNoDate.length === 1, 'missing endedAt included without date filter')
}

function testPerformanceSanity(): void {
  const sessions: Session[] = []
  for (let i = 0; i < 500; i += 1) {
    sessions.push(
      makeSession({
        sessionId: `perf-${i}`,
        scenarioId: i % 2 === 0 ? 'scenario_a' : 'scenario_b',
        outcome: i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'stopped' : 'abandoned',
        riskScore: i % 100,
        riskLevel: i % 100 > 59 ? 'high' : i % 100 > 29 ? 'medium' : 'low',
        omitRuleHits: true,
      }),
    )
  }

  const start = performance.now()
  const summary = computeSessionAnalytics(sessions, sessions.length)
  const elapsed = performance.now() - start
  assert(elapsed < 500, `aggregation under 500ms for 500 sessions (was ${elapsed.toFixed(1)}ms)`)
  assertSummaryConsistency(summary, sessions)
}

function main(): void {
  testEmptyStore()
  testSingleSession()
  testNoFlagsNoRuleHits()
  testLegacyRiskFromReport()
  testMissingEndedAtAndDuration()
  testAggregation()
  testFilters()
  testPerformanceSanity()
  console.log('Phase 3E.1 stabilization checks passed.')
}

main()
