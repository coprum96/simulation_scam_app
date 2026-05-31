import { ru } from '../../content/ru'
import type { RiskFlagId } from '../../types/risk'
import type { RiskRuleConfigDocument } from '../../types/riskRuleConfig'
import {
  builtinRiskRuleToConfig,
  getBuiltinRiskRuleConfig,
  isBuiltinRiskRuleId,
} from './builtinRiskRuleToConfig'
import { defaultRiskRuleTemplate } from './defaultRiskRuleTemplate'
import { getAuthoredDocument, listAuthoredVersions } from './riskRuleAuthoringPersistence'
import { normalizeRiskRuleConfig } from './normalizeRiskRuleConfig'

type ResolveEditorParams = {
  routeRuleId?: string
  isNew: boolean
  cloneBuiltin: boolean
  versionParam: number
  idParam: string | null
}

export function resolveEditorDocument(params: ResolveEditorParams): RiskRuleConfigDocument {
  const { routeRuleId, isNew, cloneBuiltin, versionParam, idParam } = params

  if (isNew) {
    const template = defaultRiskRuleTemplate(idParam ?? 'authored_rule_draft')
    if (cloneBuiltin && idParam && isBuiltinRiskRuleId(idParam)) {
      const builtin = builtinRiskRuleToConfig(idParam as RiskFlagId)
      const versions = listAuthoredVersions(idParam)
      const maxVersion = versions.reduce((m, v) => Math.max(m, v.version), 0)
      const now = new Date().toISOString()
      return normalizeRiskRuleConfig({
        ...builtin,
        ruleId: idParam,
        version: maxVersion + 1,
        status: 'draft',
        title: `${builtin.title} ${ru.riskRuleAuthoring.cloneTitleSuffix}`,
        createdAt: now,
        updatedAt: now,
      })
    }
    return normalizeRiskRuleConfig(template)
  }

  if (!routeRuleId) return defaultRiskRuleTemplate()

  if (versionParam > 0) {
    const authored = getAuthoredDocument(routeRuleId, versionParam)
    if (authored) return normalizeRiskRuleConfig(authored)
  }

  const versions = listAuthoredVersions(routeRuleId)
  const latestDraft = [...versions].reverse().find((v) => v.status === 'draft')
  if (latestDraft) return normalizeRiskRuleConfig(latestDraft)

  const latestAuthored = versions.at(-1)
  if (latestAuthored) return normalizeRiskRuleConfig(latestAuthored)

  const builtin = getBuiltinRiskRuleConfig(routeRuleId)
  if (builtin) return normalizeRiskRuleConfig(builtin)

  return defaultRiskRuleTemplate(routeRuleId)
}

export function isBuiltinReadOnlyView(
  routeRuleId: string | undefined,
  isNew: boolean,
  cloneBuiltin: boolean,
): boolean {
  if (isNew || cloneBuiltin || !routeRuleId) return false
  if (!isBuiltinRiskRuleId(routeRuleId)) return false
  return listAuthoredVersions(routeRuleId).length === 0
}
