import type {
  RiskRuleConfigDocument,
  RiskRuleConfigExportBundle,
  RiskRuleConfigStatus,
} from '../../types/riskRuleConfig'
import * as cache from '../../registry/registryCache'

export function listAuthoredRuleIds(): string[] {
  return cache.listRuleIds()
}

export function listAuthoredVersions(ruleId: string): RiskRuleConfigDocument[] {
  return cache.listRiskRuleVersions(ruleId)
}

export function getAuthoredDocument(
  ruleId: string,
  version: number,
): RiskRuleConfigDocument | undefined {
  return cache.getRiskRuleDocument(ruleId, version)
}

export function getLatestPublishedAuthored(ruleId: string): RiskRuleConfigDocument | undefined {
  return cache.getLatestPublishedRiskRule(ruleId)
}

export function listPublishedRiskRuleConfigs(): RiskRuleConfigDocument[] {
  return cache.listPublishedRiskRuleConfigs()
}

export function buildExportBundle(
  documents: RiskRuleConfigDocument[],
): RiskRuleConfigExportBundle {
  return {
    exportSchema: 'risk_rule_config_bundle',
    exportSchemaVersion: 1,
    exportedAt: new Date().toISOString(),
    documents,
  }
}

export function listAuthoredDocumentsByStatus(
  status: RiskRuleConfigStatus,
): RiskRuleConfigDocument[] {
  const result: RiskRuleConfigDocument[] = []
  for (const ruleId of listAuthoredRuleIds()) {
    for (const doc of listAuthoredVersions(ruleId)) {
      if (doc.status === status) result.push(doc)
    }
  }
  return result
}
