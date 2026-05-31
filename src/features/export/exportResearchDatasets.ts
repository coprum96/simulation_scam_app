import type { Session } from '../../types/contracts'
import type { ComparativeAnalytics } from '../analytics/sessionComparativeAnalytics'
import { downloadCsvFilesSequential } from './downloadCsv'
import { formatExportTimestamp } from './downloadJson'
import { RESEARCH_EXPORT_SCHEMA, type ExportMetadata } from './exportSchema'
import { buildFlatSessionDatasets } from './flatSessionDatasets'

function exportMetadata(exportedAt = new Date()): ExportMetadata {
  return {
    schemaName: RESEARCH_EXPORT_SCHEMA.name,
    schemaVersion: RESEARCH_EXPORT_SCHEMA.version,
    exportedAt: exportedAt.toISOString(),
  }
}

function filename(base: string, stamp: string): string {
  return `${base}_${stamp}.csv`
}

export function exportRawSessionsDatasetCsv(sessions: Session[]): void {
  const stamp = formatExportTimestamp()
  const metadata = exportMetadata()
  const flat = buildFlatSessionDatasets(sessions, metadata)

  downloadCsvFilesSequential([
    { rows: flat.sessionLevel, filename: filename('sessions_dataset_session_level', stamp) },
    { rows: flat.summaryLevel, filename: filename('sessions_dataset_summary_level', stamp) },
    { rows: flat.riskLevel, filename: filename('sessions_dataset_risk_level', stamp) },
  ])
}

export function exportComparativeAnalyticsDatasetCsv(
  analytics: ComparativeAnalytics,
): void {
  const stamp = formatExportTimestamp()
  const metadata = exportMetadata()

  const overviewRows = [
    {
      ...metadata,
      completed: analytics.outcomes.completed,
      stopped: analytics.outcomes.stopped,
      abandoned: analytics.outcomes.abandoned,
      averageRiskScore: analytics.averages.riskScore,
      averageDurationMs: analytics.averages.durationMs,
      warningsSeen: analytics.warningBehavior.totalSeen,
      warningsIgnored: analytics.warningBehavior.totalIgnored,
      ignoredRatePercent: analytics.warningBehavior.ignoredRatePercent,
      matchedExpected: analytics.flagComparison.matchedExpectedTotal,
      missedExpected: analytics.flagComparison.missedExpectedTotal,
      unexpected: analytics.flagComparison.unexpectedTotal,
      sessionsWithConfirm: analytics.patterns.sessionsWithConfirm,
      sessionsWithCancel: analytics.patterns.sessionsWithCancel,
      sessionsWithBoth: analytics.patterns.sessionsWithBoth,
    },
  ]

  const comparisonRows = [
    ...analytics.comparisons.byScenario.map((row) => ({
      ...metadata,
      groupType: 'scenario',
      groupKey: row.key,
      sessions: row.sessions,
      averageRiskScore: row.averageRiskScore,
      completed: row.completed,
      stopped: row.stopped,
      abandoned: row.abandoned,
    })),
    ...analytics.comparisons.byProfile.map((row) => ({
      ...metadata,
      groupType: 'profile',
      groupKey: row.key,
      sessions: row.sessions,
      averageRiskScore: row.averageRiskScore,
      completed: row.completed,
      stopped: row.stopped,
      abandoned: row.abandoned,
    })),
    ...analytics.comparisons.bySimulator.map((row) => ({
      ...metadata,
      groupType: 'simulator',
      groupKey: row.key,
      sessions: row.sessions,
      averageRiskScore: row.averageRiskScore,
      completed: row.completed,
      stopped: row.stopped,
      abandoned: row.abandoned,
    })),
  ]

  const behaviorRows = [
    ...analytics.warningBehavior.mostIgnoredWarnings.map((row) => ({
      ...metadata,
      category: 'most_ignored_warnings',
      key: row.key,
      count: row.count,
    })),
    ...analytics.patterns.mostCommonAbandonPoints.map((row) => ({
      ...metadata,
      category: 'most_common_abandon_points',
      key: row.key,
      count: row.count,
    })),
    ...analytics.flagComparison.mostMatchedExpected.map((row) => ({
      ...metadata,
      category: 'most_matched_expected_flags',
      key: row.key,
      count: row.count,
    })),
    ...analytics.flagComparison.mostMissedExpected.map((row) => ({
      ...metadata,
      category: 'most_missed_expected_flags',
      key: row.key,
      count: row.count,
    })),
    ...analytics.flagComparison.mostUnexpected.map((row) => ({
      ...metadata,
      category: 'most_unexpected_flags',
      key: row.key,
      count: row.count,
    })),
  ]

  downloadCsvFilesSequential([
    { rows: overviewRows, filename: filename('comparative_analytics_overview', stamp) },
    { rows: comparisonRows, filename: filename('comparative_analytics_comparisons', stamp) },
    { rows: behaviorRows, filename: filename('comparative_analytics_behavior', stamp) },
  ])
}

