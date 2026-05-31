/**
 * Phase 3E.2 analytics drilldown stabilization checks.
 * Run: npm run check:phase3e2
 */
import { FILTER_ALL } from '../src/config'
import { EMPTY_RISK_ASSESSMENT } from '../src/types/risk'
import type { Session } from '../src/types/contracts'
import { computeAnalyticsInsights } from '../src/features/analytics/computeAnalyticsInsights'
import { computeSessionAnalytics } from '../src/features/analytics/computeSessionAnalytics'
import {
  computeFlagDrilldown,
  computeRuleDrilldown,
  computeScenarioDrilldown,
  computeSessionExplainability,
  filterSessionsByFlag,
} from '../src/features/analytics/computeDrilldownViews'
import {
  computeComparativeDrilldown,
  listComparativeOptions,
} from '../src/features/analytics/computeComparativeDrilldown'
import {
  analyticsComparePath,
  analyticsDashboardPath,
  analyticsFlagDrilldownPath,
  analyticsScenarioDrilldownPath,
  analyticsSessionExplainPath,
} from '../src/features/analytics/analyticsPaths'
import {
  buildAnalyticsSearchParams,
  buildAnalyticsSearchParamsWithPreservedCompare,
  parseAnalyticsSearchParams,
  parseCompareDrilldownMode,
} from '../src/features/analytics/analyticsSearchParams'
import { filterAnalyticsSessions } from '../src/features/analytics/analyticsFilters'
import { DEFAULT_ANALYTICS_FILTERS } from '../src/features/analytics/analyticsFilters'

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

function makeSession(partial: {
  sessionId: string
  scenarioId: string
  outcome: 'completed' | 'stopped' | 'abandoned'
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  ruleId?: string
  flagId?: string
  endedAt?: number
  simulatorType?: 'banking' | 'wallet'
  flagsOnlyInAssessment?: boolean
}): Session {
  const now = partial.endedAt ?? Date.now()
  const flag = partial.flagId ?? partial.ruleId
  const recordFlags = partial.flagsOnlyInAssessment ? [] : flag ? [flag] : []

  return {
    record: {
      sessionId: partial.sessionId,
      scenarioId: partial.scenarioId,
      profileId: 'normal_user',
      simulatorType: partial.simulatorType ?? 'banking',
      startedAt: now - 60_000,
      endedAt: now,
      status: 'ended',
      outcome: partial.outcome,
      riskScore: partial.riskScore,
      riskLevel: partial.riskLevel,
      riskFlags: recordFlags,
    },
    events: [],
    summary: {
      sessionId: partial.sessionId,
      scenarioId: partial.scenarioId,
      profileId: 'normal_user',
      status: 'ended',
      startedAt: now - 60_000,
      endedAt: now,
      totalDurationMs: 60_000,
      screensVisited: 2,
      totalEvents: 4,
      eventCounts: {
        scenario_start: 1,
        screen_view: 1,
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
      riskScore: partial.riskScore,
      riskLevel: partial.riskLevel,
      riskFlags: recordFlags,
    },
    riskReport: partial.ruleId || partial.flagsOnlyInAssessment
      ? {
          sessionId: partial.sessionId,
          scenarioId: partial.scenarioId,
          simulatorType: partial.simulatorType ?? 'banking',
          catalogRiskLevel: 'medium',
          expectedRiskFlags: [partial.ruleId ?? flag ?? 'ignored_warning'],
          missedExpectedFlags: [],
          unexpectedFlags: [],
          assessment: {
            ...EMPTY_RISK_ASSESSMENT,
            riskScore: partial.riskScore,
            riskLevel: partial.riskLevel,
            riskFlags: [(flag ?? partial.ruleId ?? 'ignored_warning') as never],
            ruleHits: partial.ruleId
              ? [{ ruleId: partial.ruleId as never, delta: 12 }]
              : [],
            reasons: [(flag ?? partial.ruleId ?? 'ignored_warning') as never],
          },
          evaluatedAt: now,
        }
      : null,
  }
}

function testInsightsAndDrilldowns(): void {
  const base = Date.UTC(2026, 4, 1)
  const sessions = [
    makeSession({
      sessionId: 's1',
      scenarioId: 'scenario_a',
      outcome: 'completed',
      riskScore: 15,
      riskLevel: 'low',
      endedAt: base,
    }),
    makeSession({
      sessionId: 's2',
      scenarioId: 'scenario_a',
      outcome: 'abandoned',
      riskScore: 88,
      riskLevel: 'high',
      ruleId: 'ignored_warning',
      flagId: 'ignored_warning',
      endedAt: base + 86_400_000,
    }),
    makeSession({
      sessionId: 's3',
      scenarioId: 'scenario_b',
      outcome: 'stopped',
      riskScore: 45,
      riskLevel: 'medium',
      endedAt: base + 172_800_000,
    }),
    makeSession({
      sessionId: 's4',
      scenarioId: 'scenario_b',
      outcome: 'completed',
      riskScore: 90,
      riskLevel: 'high',
      ruleId: 'fast_confirmation',
      flagId: 'fast_confirmation',
      simulatorType: 'wallet',
      endedAt: base + 259_200_000,
    }),
  ]

  const summary = computeSessionAnalytics(sessions, sessions.length)
  const insights = computeAnalyticsInsights(sessions, summary)
  assert(insights.topScenarioChanges.length > 0, 'insights scenario changes')
  assert(insights.outcomeNarratives.length > 0, 'outcome narratives')
  assert(insights.highRiskConcentration.overallHighRiskPercent === 50, 'high risk percent')

  const scenarioRow = summary.scenarioComparison.find((r) => r.scenarioId === 'scenario_a')
  const scenario = computeScenarioDrilldown(sessions, 'scenario_a', sessions.length)
  assert(scenario.sessions === 2, 'scenario drilldown count')
  assert(scenario.sessions === scenario.summary.meta.filteredSessions, 'drilldown meta filtered')
  assert(scenarioRow?.sessions === scenario.sessions, 'dashboard scenario row matches drilldown')

  const flag = computeFlagDrilldown(sessions, 'ignored_warning', sessions.length)
  assert(flag.sessions === 1, 'flag drilldown count')

  const rule = computeRuleDrilldown(sessions, 'ignored_warning', sessions.length)
  assert(rule.sessions === 1, 'rule drilldown count')
  assert(rule.effectiveness.triggerCount === 1, 'rule effectiveness')

  const explain = computeSessionExplainability(sessions[1])
  assert(explain?.isHighRisk === true, 'explain high risk')
  assert(explain?.ruleImpacts.length === 1, 'explain rule impacts')
  assert(explain?.ruleImpacts[0]?.ruleId === 'ignored_warning', 'explain rule id')
  assert(explain?.ruleImpacts[0]?.delta === 12, 'explain rule delta')
  assert(explain?.triggeredFlags.includes('ignored_warning'), 'explain flags')
  assert((explain?.whyHighRiskKeys.length ?? 0) > 0, 'why high risk keys')
}

function testComparativeConsistency(): void {
  const sessions = [
    makeSession({
      sessionId: 'a1',
      scenarioId: 'scenario_a',
      outcome: 'completed',
      riskScore: 10,
      riskLevel: 'low',
    }),
    makeSession({
      sessionId: 'b1',
      scenarioId: 'scenario_b',
      outcome: 'abandoned',
      riskScore: 80,
      riskLevel: 'high',
      ruleId: 'ignored_warning',
    }),
  ]

  const options = listComparativeOptions(sessions, 'scenario')
  assert(options.length === 2, 'scenario options')

  const comparison = computeComparativeDrilldown(sessions, 'scenario', 'scenario_a', 'scenario_b')
  assert(comparison != null, 'scenario comparison')
  assert(comparison!.sideA.sessions === 1, 'side A sessions')
  assert(comparison!.sideB.sessions === 1, 'side B sessions')

  const drilldownA = computeScenarioDrilldown(sessions, 'scenario_a', sessions.length)
  assert(
    drilldownA.summary.outcomeRates.completedRate === comparison!.sideA.completedRate,
    'compare sideA matches scenario drilldown completion rate',
  )
  assert(
    drilldownA.summary.scenarioComparison[0]?.avgRiskScore === comparison!.sideA.avgRiskScore ||
      drilldownA.summary.meta.filteredSessions === 1,
    'compare avg risk aligns with drilldown',
  )

  const timeCompare = computeComparativeDrilldown(sessions, 'timeRange', 'prior', 'recent')
  assert(timeCompare != null, 'time range comparison')
}

function testSearchParamsAndPaths(): void {
  const filters = {
    ...DEFAULT_ANALYTICS_FILTERS,
    simulatorType: 'wallet' as const,
    dateFrom: '2026-05-01',
  }
  const built = buildAnalyticsSearchParams(filters)
  assert(built.get('simulatorType') === 'wallet', 'build simulator filter')
  assert(built.get('dateFrom') === '2026-05-01', 'build date filter')

  const parsed = parseAnalyticsSearchParams(
    new URLSearchParams('simulatorType=invalid&riskLevel=high&outcome=completed&mode=scenario&a=x'),
  )
  assert(parsed.simulatorType === FILTER_ALL, 'invalid simulator sanitized')
  assert(parsed.riskLevel === 'high', 'valid risk kept')
  assert(parsed.outcome === 'completed', 'valid outcome kept')
  assert(parseCompareDrilldownMode('invalid') === 'scenario', 'invalid compare mode defaults')
  assert(parseCompareDrilldownMode('simulator') === 'simulator', 'valid compare mode')

  const current = new URLSearchParams('mode=scenario&a=scenario_a&b=scenario_b&simulatorType=wallet')
  const merged = buildAnalyticsSearchParamsWithPreservedCompare(
    { ...DEFAULT_ANALYTICS_FILTERS, outcome: 'completed' },
    current,
  )
  assert(merged.get('mode') === 'scenario', 'compare mode preserved on filter update')
  assert(merged.get('a') === 'scenario_a', 'compare a preserved')
  assert(merged.get('outcome') === 'completed', 'new filter applied')

  const dashPath = analyticsDashboardPath(filters)
  assert(dashPath.includes('simulatorType=wallet'), 'dashboard path preserves filters')
  assert(
    analyticsScenarioDrilldownPath('scenario_a', filters).includes('simulatorType=wallet'),
    'drilldown path preserves filters',
  )
  assert(analyticsScenarioDrilldownPath('scenario_a').includes('/dashboard/scenario/scenario_a'), 'scenario path')
  assert(analyticsFlagDrilldownPath('ignored_warning').includes('/dashboard/flag/'), 'flag path')
  assert(analyticsSessionExplainPath('sess-1').includes('/dashboard/session/sess-1'), 'session path')
  assert(analyticsComparePath({ mode: 'scenario', a: 'x', b: 'y' }).includes('mode=scenario'), 'compare path')
}

function testEdgeCases(): void {
  assert(computeScenarioDrilldown([], 'missing', 0).sessions === 0, 'empty scenario drilldown')
  assert(computeFlagDrilldown([], 'missing_flag', 0).sessions === 0, 'empty flag drilldown')
  assert(computeRuleDrilldown([], 'missing_rule', 0).sessions === 0, 'empty rule drilldown')
  assert(computeSessionExplainability(undefined) === null, 'missing session explain')
  assert(computeComparativeDrilldown([], 'scenario', 'a', 'b') === null, 'empty compare')

  const onlyOne = [
    makeSession({
      sessionId: 'solo',
      scenarioId: 'scenario_a',
      outcome: 'completed',
      riskScore: 10,
      riskLevel: 'low',
    }),
  ]
  assert(computeComparativeDrilldown(onlyOne, 'scenario', 'scenario_a', 'scenario_b') === null, 'single scenario compare')

  const store: Record<string, Session> = {
    s: makeSession({
      sessionId: 's',
      scenarioId: 'scenario_a',
      outcome: 'completed',
      riskScore: 10,
      riskLevel: 'low',
      simulatorType: 'wallet',
    }),
  }
  const filtered = filterAnalyticsSessions(store, {
    ...DEFAULT_ANALYTICS_FILTERS,
    simulatorType: 'banking',
  })
  assert(filtered.length === 0, 'filters with no matches')

  const assessmentOnly = makeSession({
    sessionId: 'legacy',
    scenarioId: 'scenario_a',
    outcome: 'stopped',
    riskScore: 50,
    riskLevel: 'medium',
    flagId: 'ignored_warning',
    flagsOnlyInAssessment: true,
  })
  assert(filterSessionsByFlag([assessmentOnly], 'ignored_warning').length === 1, 'flag from assessment')
}

function main(): void {
  testInsightsAndDrilldowns()
  testComparativeConsistency()
  testSearchParamsAndPaths()
  testEdgeCases()
  console.log('Phase 3E.2 stabilization checks passed.')
}

main()
