import { mockScenarios } from '../../data/scenariosCatalog'
import type { SimulatorType } from '../../types/scenario'
import type { RiskLevel } from '../../types/risk'
import type { ScenarioConfigStatus } from '../../types/scenarioConfig'
import { formatActorName, formatAuditTimestamp } from '../authoring-audit'
import { listAuthoredScenarioIds, listAuthoredVersions } from './scenarioAuthoringPersistence'

export type AuthoringCatalogItem = {
  scenarioId: string
  title: string
  simulatorType: SimulatorType
  riskLevel: RiskLevel
  source: 'builtin' | 'authored'
  status: ScenarioConfigStatus | 'builtin'
  versionLabel: string
  lastModifiedLabel: string
  publishedAtLabel: string
}

export function listAuthoringCatalog(): AuthoringCatalogItem[] {
  const builtinItems: AuthoringCatalogItem[] = mockScenarios.map((s) => ({
    scenarioId: s.id,
    title: s.title,
    simulatorType: s.simulatorType,
    riskLevel: s.riskLevel,
    source: 'builtin',
    status: 'builtin',
    versionLabel: 'builtin',
    lastModifiedLabel: '—',
    publishedAtLabel: '—',
  }))

  const authoredItems: AuthoringCatalogItem[] = listAuthoredScenarioIds().map((scenarioId) => {
    const versions = listAuthoredVersions(scenarioId)
    const latest = versions[0]
    const published = versions.find((v) => v.status === 'published')
    const inReview = versions.find((v) => v.status === 'in_review')
    const draft = versions.find((v) => v.status === 'draft')
    const display = published ?? inReview ?? draft ?? latest
    const lifecycle = display?.lifecycle
    return {
      scenarioId,
      title: latest?.metadata.title ?? scenarioId,
      simulatorType: latest?.metadata.simulatorType ?? 'banking',
      riskLevel: latest?.metadata.riskLevel ?? 'medium',
      source: 'authored' as const,
      status: display?.status ?? 'draft',
      versionLabel: display ? `v${display.version}` : `v${latest?.version ?? 1}`,
      lastModifiedLabel: lifecycle?.lastModifiedBy
        ? `${formatActorName(lifecycle.lastModifiedBy.displayName)} · ${lifecycle.lastModifiedAt ? formatAuditTimestamp(lifecycle.lastModifiedAt) : '—'}`
        : '—',
      publishedAtLabel: lifecycle?.publishedAt
        ? formatAuditTimestamp(lifecycle.publishedAt)
        : '—',
    }
  })

  return [...builtinItems, ...authoredItems]
}
