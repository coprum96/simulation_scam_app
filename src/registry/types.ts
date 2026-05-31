import type { AuditEvent } from '../types/audit'
import type { RiskRuleConfigDocument } from '../types/riskRuleConfig'
import type { ScenarioConfigDocument } from '../types/scenarioConfig'

export type RegistrySyncStatus = 'idle' | 'loading' | 'ready' | 'error' | 'offline'

export type RegistryDataSource = 'backend' | 'local' | null

export type RegistrySnapshot = {
  schemaVersion: 1
  scenarios: Record<string, ScenarioConfigDocument[]>
  riskRules: Record<string, RiskRuleConfigDocument[]>
  auditLog?: AuditEvent[]
  migratedFromLocalAt?: string | null
}

export type RegistryMigratePayload = {
  scenarios: Record<string, ScenarioConfigDocument[]>
  riskRules: Record<string, RiskRuleConfigDocument[]>
}
