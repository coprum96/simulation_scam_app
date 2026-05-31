import type { SessionRecord, SessionSummary } from '../../types/contracts'
import type { RiskFlagId } from '../../types/risk'
import type { Scenario } from '../../types/scenario'
import type { TelemetryEvent } from '../../types/telemetry'

export type RiskRuleContext = {
  events: TelemetryEvent[]
  summary: SessionSummary
  scenario: Scenario
  record: SessionRecord
}

export type RiskRuleSource = 'builtin' | 'authored'

export type RiskRuleDefinition = {
  id: RiskFlagId
  delta: number
  condition: (ctx: RiskRuleContext) => boolean
  source: RiskRuleSource
}
