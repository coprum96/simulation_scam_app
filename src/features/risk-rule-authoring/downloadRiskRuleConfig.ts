import type { RiskRuleConfigDocument } from '../../types/riskRuleConfig'
import { buildExportBundle } from './riskRuleAuthoringPersistence'

export function downloadRiskRuleConfigDocument(doc: RiskRuleConfigDocument): void {
  const bundle = buildExportBundle([doc])
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `risk-rule-${doc.ruleId}-v${doc.version}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}
