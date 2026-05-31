import type { RiskFlagId } from '../../types/risk'
import type { RiskRuleConfigDocument } from '../../types/riskRuleConfig'
import { formatActorName, formatAuditTimestamp } from '../authoring-audit'
import { listBuiltinRiskRuleIdsForAuthoring, builtinRiskRuleToConfig } from './builtinRiskRuleToConfig'
import {
  getLatestPublishedAuthored,
  listAuthoredRuleIds,
  listAuthoredVersions,
} from './riskRuleAuthoringPersistence'

export type RiskRuleCatalogItem = {
  ruleId: string
  title: string
  source: 'builtin' | 'authored'
  enabled: boolean
  scoreDelta: number
  version: number
  status: RiskRuleConfigDocument['status']
  hasAuthoredOverride: boolean
  lastModifiedLabel: string
  publishedAtLabel: string
}

function lifecycleLabels(doc: RiskRuleConfigDocument | undefined) {
  const lifecycle = doc?.lifecycle
  return {
    lastModifiedLabel: lifecycle?.lastModifiedBy
      ? `${formatActorName(lifecycle.lastModifiedBy.displayName)} · ${lifecycle.lastModifiedAt ? formatAuditTimestamp(lifecycle.lastModifiedAt) : '—'}`
      : '—',
    publishedAtLabel: lifecycle?.publishedAt ? formatAuditTimestamp(lifecycle.publishedAt) : '—',
  }
}

export function listRiskRuleAuthoringCatalog(): RiskRuleCatalogItem[] {
  const items: RiskRuleCatalogItem[] = []
  const authoredIds = new Set(listAuthoredRuleIds())

  for (const ruleId of listBuiltinRiskRuleIdsForAuthoring()) {
    const authored = getLatestPublishedAuthored(ruleId)
    const builtin = builtinRiskRuleToConfig(ruleId)
    if (authored) {
      items.push({
        ruleId,
        title: authored.title,
        source: 'authored',
        enabled: authored.enabled,
        scoreDelta: authored.scoreDelta,
        version: authored.version,
        status: authored.status,
        hasAuthoredOverride: true,
        ...lifecycleLabels(authored),
      })
    } else {
      items.push({
        ruleId,
        title: builtin.title,
        source: 'builtin',
        enabled: builtin.enabled,
        scoreDelta: builtin.scoreDelta,
        version: builtin.version,
        status: builtin.status,
        hasAuthoredOverride: false,
        lastModifiedLabel: '—',
        publishedAtLabel: '—',
      })
    }
  }

  for (const ruleId of authoredIds) {
    if (listBuiltinRiskRuleIdsForAuthoring().includes(ruleId as RiskFlagId)) continue
    const versions = listAuthoredVersions(ruleId)
    const latest = versions.at(-1)
    if (!latest) continue
    items.push({
      ruleId,
      title: latest.title,
      source: 'authored',
      enabled: latest.enabled,
      scoreDelta: latest.scoreDelta,
      version: latest.version,
      status: latest.status,
      hasAuthoredOverride: false,
      ...lifecycleLabels(latest),
    })
  }

  return items.sort((a, b) => a.ruleId.localeCompare(b.ruleId))
}
