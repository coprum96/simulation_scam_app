import type { AuditEvent } from '../types/audit'
import type { RiskRuleConfigDocument } from '../types/riskRuleConfig'
import type { ScenarioConfigDocument } from '../types/scenarioConfig'
import type { RegistrySnapshot } from './types'

let scenarios: Record<string, ScenarioConfigDocument[]> = {}
let riskRules: Record<string, RiskRuleConfigDocument[]> = {}
let auditLog: AuditEvent[] = []

export function hydrateRegistryCache(snapshot: RegistrySnapshot): void {
  scenarios = structuredClone(snapshot.scenarios ?? {})
  riskRules = structuredClone(snapshot.riskRules ?? {})
  auditLog = structuredClone(snapshot.auditLog ?? [])
}

export function getRegistryCacheSnapshot(): RegistrySnapshot {
  return {
    schemaVersion: 1,
    scenarios: structuredClone(scenarios),
    riskRules: structuredClone(riskRules),
    auditLog: structuredClone(auditLog),
  }
}

export function listAuditEventsForEntity(
  entityType: AuditEvent['entityType'],
  entityId: string,
  version?: number,
): AuditEvent[] {
  return auditLog.filter((e) => {
    if (e.entityType !== entityType || e.entityId !== entityId) return false
    if (version != null && e.version !== version) return false
    return true
  })
}

export function prependAuditEvents(events: AuditEvent[]): void {
  auditLog = [...events, ...auditLog]
}

export function listScenarioIds(): string[] {
  return Object.keys(scenarios).sort()
}

export function listScenarioVersions(scenarioId: string): ScenarioConfigDocument[] {
  return [...(scenarios[scenarioId] ?? [])].sort((a, b) => b.version - a.version)
}

export function getScenarioDocument(
  scenarioId: string,
  version: number,
): ScenarioConfigDocument | undefined {
  return listScenarioVersions(scenarioId).find((v) => v.version === version)
}

export function upsertScenarioDocument(
  doc: ScenarioConfigDocument,
  options?: { previousScenarioId?: string },
): void {
  const previousId = options?.previousScenarioId?.trim()
  if (previousId && previousId !== doc.scenarioId) {
    delete scenarios[previousId]
  }
  const versions = scenarios[doc.scenarioId] ?? []
  const next = versions.filter((v) => v.version !== doc.version)
  next.push(doc)
  scenarios[doc.scenarioId] = next.sort((a, b) => a.version - b.version)
}

export function removeScenarioVersion(scenarioId: string, version: number): void {
  const versions = scenarios[scenarioId]
  if (!versions) return
  const next = versions.filter((v) => v.version !== version)
  if (next.length === 0) delete scenarios[scenarioId]
  else scenarios[scenarioId] = next
}

export function getPublishedScenarioConfig(scenarioId: string): ScenarioConfigDocument | undefined {
  const published = listScenarioVersions(scenarioId).filter((v) => v.status === 'published')
  return published.sort((a, b) => b.version - a.version)[0]
}

export function listPublishedScenarioConfigs(): ScenarioConfigDocument[] {
  const result: ScenarioConfigDocument[] = []
  for (const scenarioId of listScenarioIds()) {
    const pub = getPublishedScenarioConfig(scenarioId)
    if (pub) result.push(pub)
  }
  return result
}

export function listRuleIds(): string[] {
  return Object.keys(riskRules).sort()
}

export function listRiskRuleVersions(ruleId: string): RiskRuleConfigDocument[] {
  return [...(riskRules[ruleId] ?? [])].sort((a, b) => a.version - b.version)
}

export function getRiskRuleDocument(
  ruleId: string,
  version: number,
): RiskRuleConfigDocument | undefined {
  return listRiskRuleVersions(ruleId).find((d) => d.version === version)
}

export function upsertRiskRuleDocument(
  doc: RiskRuleConfigDocument,
  options?: { previousRuleId?: string },
): void {
  const previousId = options?.previousRuleId?.trim()
  if (previousId && previousId !== doc.ruleId) {
    delete riskRules[previousId]
  }
  const versions = riskRules[doc.ruleId] ?? []
  const next = versions.filter((v) => v.version !== doc.version)
  next.push(doc)
  riskRules[doc.ruleId] = next.sort((a, b) => a.version - b.version)
}

export function removeRiskRuleVersion(ruleId: string, version: number): void {
  const versions = riskRules[ruleId]
  if (!versions) return
  const next = versions.filter((v) => v.version !== version)
  if (next.length === 0) delete riskRules[ruleId]
  else riskRules[ruleId] = next
}

export function getLatestPublishedRiskRule(ruleId: string): RiskRuleConfigDocument | undefined {
  const published = listRiskRuleVersions(ruleId).filter((d) => d.status === 'published')
  return published.at(-1)
}

export function listPublishedRiskRuleConfigs(): RiskRuleConfigDocument[] {
  const result: RiskRuleConfigDocument[] = []
  for (const ruleId of listRuleIds()) {
    const latest = getLatestPublishedRiskRule(ruleId)
    if (latest) result.push(latest)
  }
  return result
}

export function importScenarioDocuments(documents: ScenarioConfigDocument[]): void {
  for (const doc of documents) {
    upsertScenarioDocument(doc)
  }
}

export function importRiskRuleDocuments(documents: RiskRuleConfigDocument[]): void {
  for (const doc of documents) {
    upsertRiskRuleDocument(doc)
  }
}
