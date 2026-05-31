import type { RiskRuleConfigDocument } from '../types/riskRuleConfig'
import type { ScenarioConfigDocument } from '../types/scenarioConfig'
import type { RegistryMigratePayload } from './types'

const SCENARIO_STORAGE_KEY = 'scam_app_ru.scenario_authoring.v1'
const RISK_RULE_STORAGE_KEY = 'scam_app_ru.risk_rule_authoring.v1'

type ScenarioStoreV1 = {
  schemaVersion: 1
  versionsByScenarioId: Record<string, ScenarioConfigDocument[]>
}

type RiskRuleStoreV1 = {
  schemaVersion: 1
  versionsByRuleId: Record<string, RiskRuleConfigDocument[]>
}

function hasWindowStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readJson<T>(key: string): T | null {
  if (!hasWindowStorage()) return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function loadLocalAuthoringSnapshot(): RegistryMigratePayload {
  const scenarioStore = readJson<ScenarioStoreV1>(SCENARIO_STORAGE_KEY)
  const riskStore = readJson<RiskRuleStoreV1>(RISK_RULE_STORAGE_KEY)
  return {
    scenarios: scenarioStore?.versionsByScenarioId ?? {},
    riskRules: riskStore?.versionsByRuleId ?? {},
  }
}

export function countLocalDocuments(payload: RegistryMigratePayload): number {
  const scenarioCount = Object.values(payload.scenarios).reduce((n, v) => n + v.length, 0)
  const riskCount = Object.values(payload.riskRules).reduce((n, v) => n + v.length, 0)
  return scenarioCount + riskCount
}

export function isRegistryEmpty(snapshot: RegistryMigratePayload): boolean {
  return countLocalDocuments(snapshot) === 0
}
