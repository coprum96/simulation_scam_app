import { downloadCsvFilesSequential } from '../export/downloadCsv'
import { downloadJsonFile, formatExportTimestamp } from '../export/downloadJson'
import { RESEARCH_EXPORT_SCHEMA } from '../export/exportSchema'
import type { SessionAnalyticsSummary } from './types'

function stamp(): string {
  return formatExportTimestamp()
}

export function exportAnalyticsSummaryJson(summary: SessionAnalyticsSummary): void {
  downloadJsonFile(
    {
      schemaName: 'analytics_summary',
      schemaVersion: 1,
      researchExportSchema: RESEARCH_EXPORT_SCHEMA,
      ...summary,
    },
    `analytics_summary_${stamp()}.json`,
  )
}

export function exportAnalyticsSummaryCsv(summary: SessionAnalyticsSummary): void {
  const meta = {
    exportedAt: summary.meta.computedAt,
    totalSessions: summary.meta.totalSessions,
    filteredSessions: summary.meta.filteredSessions,
  }

  const overview = [
    {
      ...meta,
      avgDurationMs: summary.avgDurationMs,
      completedRate: summary.outcomeRates.completedRate,
      stoppedRate: summary.outcomeRates.stoppedRate,
      abandonedRate: summary.outcomeRates.abandonedRate,
      completed: summary.outcomeRates.completed,
      stopped: summary.outcomeRates.stopped,
      abandoned: summary.outcomeRates.abandoned,
    },
  ]

  const scenarioRows = summary.scenarioComparison.map((row) => ({
    ...meta,
    scenarioId: row.scenarioId,
    sessions: row.sessions,
    completedRate: row.completedRate,
    stoppedRate: row.stoppedRate,
    abandonedRate: row.abandonedRate,
    avgDurationMs: row.avgDurationMs,
    avgRiskScore: row.avgRiskScore,
    highRiskCount: row.highRiskCount,
  }))

  const flagRows = summary.topRiskFlags.map((row) => ({
    ...meta,
    flagId: row.key,
    count: row.count,
    percent: row.percent,
  }))

  const ruleRows = summary.ruleEffectiveness.map((row) => ({
    ...meta,
    ruleId: row.ruleId,
    triggerCount: row.triggerCount,
    sessionsTriggered: row.sessionsTriggered,
    sessionSharePercent: row.sessionSharePercent,
    totalScoreImpact: row.totalScoreImpact,
    avgScoreImpact: row.avgScoreImpact,
  }))

  const scoreRows = summary.riskScoreDistribution.map((row) => ({
    ...meta,
    rangeLabel: row.rangeLabel,
    count: row.count,
    percent: row.percent,
  }))

  const outcomeRiskRows = summary.outcomeByRiskLevel.map((row) => ({
    ...meta,
    riskLevel: row.riskLevel,
    sessions: row.sessions,
    completedRate: row.rates.completedRate,
    stoppedRate: row.rates.stoppedRate,
    abandonedRate: row.rates.abandonedRate,
    completed: row.rates.completed,
    stopped: row.rates.stopped,
    abandoned: row.rates.abandoned,
  }))

  const highRiskRows = summary.highRiskSessions.map((row) => ({
    ...meta,
    sessionId: row.sessionId,
    scenarioId: row.scenarioId,
    simulatorType: row.simulatorType,
    outcome: row.outcome ?? '',
    riskScore: row.riskScore,
    riskLevel: row.riskLevel,
    topFlags: row.topFlags.join('; '),
    endedAt: row.endedAt,
  }))

  const s = stamp()
  downloadCsvFilesSequential([
    { rows: overview, filename: `analytics_summary_overview_${s}.csv` },
    { rows: scenarioRows, filename: `analytics_summary_scenarios_${s}.csv` },
    { rows: flagRows, filename: `analytics_summary_flags_${s}.csv` },
    { rows: ruleRows, filename: `analytics_summary_rules_${s}.csv` },
    { rows: scoreRows, filename: `analytics_summary_scores_${s}.csv` },
    { rows: outcomeRiskRows, filename: `analytics_summary_outcome_risk_${s}.csv` },
    { rows: highRiskRows, filename: `analytics_summary_high_risk_${s}.csv` },
  ])
}
