import { ru } from '../../content/ru'
import type { AnalyticsOutcomeNarrative } from './drilldownTypes'
import { riskLevelLabel } from '../../config'

export function formatInsightNarrative(row: AnalyticsOutcomeNarrative): string {
  const level = riskLevelLabel(row.riskLevel)
  const templates = ru.analytics.outcomeNarratives
  const template = templates[row.narrativeKey] ?? templates.generic
  return template({
    level,
    sessions: row.sessions,
    completedRate: row.completedRate,
    abandonedRate: row.abandonedRate,
    stoppedRate: row.stoppedRate,
  })
}
