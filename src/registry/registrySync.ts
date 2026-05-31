import {
  createRiskRuleDraftVersion,
  createScenarioDraftVersion,
  deleteRiskRuleVersion,
  deleteScenarioVersion,
  fetchRegistrySnapshot,
  fetchRiskRuleAudit,
  fetchScenarioAudit,
  publishRiskRuleVersion,
  publishScenarioVersion,
  RegistryApiError,
  saveRiskRuleDraft,
  saveScenarioDraft,
  submitRiskRuleReview,
  submitScenarioReview,
} from './apiClient'
import { getRegistryBootstrapState, setRegistrySyncError } from './bootstrapRegistry'
import * as cache from './registryCache'
import { sanitizeRegistrySnapshot } from './sanitizeRegistrySnapshot'
import type { AuditEvent } from '../types/audit'
import type { RiskRuleConfigDocument } from '../types/riskRuleConfig'
import type { ScenarioConfigDocument } from '../types/scenarioConfig'

function isBackendActive(): boolean {
  const { status, source } = getRegistryBootstrapState()
  return status === 'ready' && source === 'backend'
}

export async function rehydrateCacheFromBackend(): Promise<void> {
  if (!isBackendActive()) return
  const snapshot = sanitizeRegistrySnapshot(await fetchRegistrySnapshot())
  cache.hydrateRegistryCache(snapshot)
}

async function withBackendRollback<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    try {
      await rehydrateCacheFromBackend()
    } catch {
      // keep rollback error secondary
    }
    const message =
      error instanceof RegistryApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'sync_failed'
    setRegistrySyncError(message)
    throw error instanceof RegistryApiError ? error : new RegistryApiError(0, message)
  }
}

export async function syncSaveScenario(
  doc: ScenarioConfigDocument,
  options?: { previousScenarioId?: string },
): Promise<ScenarioConfigDocument> {
  if (!isBackendActive()) {
    cache.upsertScenarioDocument(doc, options)
    return doc
  }
  return withBackendRollback(async () => {
    const saved = await saveScenarioDraft(doc, options)
    cache.upsertScenarioDocument(saved, options)
    setRegistrySyncError(null)
    return saved
  })
}

export async function syncPublishScenario(
  scenarioId: string,
  version: number,
  options?: { note?: string },
): Promise<ScenarioConfigDocument | null> {
  const existing = cache.getScenarioDocument(scenarioId, version)
  if (!existing) return null

  if (!isBackendActive()) {
    const now = new Date().toISOString()
    for (const v of cache.listScenarioVersions(scenarioId)) {
      if (v.version === version) {
        cache.upsertScenarioDocument({ ...v, status: 'published', updatedAt: now })
      } else if (v.status === 'published') {
        cache.upsertScenarioDocument({ ...v, status: 'draft', updatedAt: now })
      }
    }
    return cache.getScenarioDocument(scenarioId, version) ?? null
  }

  return withBackendRollback(async () => {
    const published = await publishScenarioVersion(scenarioId, version, { note: options?.note })
    const now = published.updatedAt
    for (const v of cache.listScenarioVersions(scenarioId)) {
      if (v.version === version) {
        cache.upsertScenarioDocument(published)
      } else if (v.status === 'published') {
        cache.upsertScenarioDocument({ ...v, status: 'draft', updatedAt: now })
      }
    }
    await rehydrateCacheFromBackend()
    setRegistrySyncError(null)
    return published
  })
}

export async function syncCreateScenarioDraft(
  base: ScenarioConfigDocument,
): Promise<ScenarioConfigDocument> {
  if (!isBackendActive()) {
    const versions = cache.listScenarioVersions(base.scenarioId)
    const maxVersion = versions.reduce((m, v) => Math.max(m, v.version), 0)
    const now = new Date().toISOString()
    const draft: ScenarioConfigDocument = {
      ...structuredClone(base),
      version: maxVersion + 1,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    }
    cache.upsertScenarioDocument(draft)
    return draft
  }

  return withBackendRollback(async () => {
    const draft = await createScenarioDraftVersion(base)
    cache.upsertScenarioDocument(draft)
    setRegistrySyncError(null)
    return draft
  })
}

export async function syncDeleteScenarioVersion(scenarioId: string, version: number): Promise<void> {
  if (!isBackendActive()) {
    cache.removeScenarioVersion(scenarioId, version)
    return
  }

  await withBackendRollback(async () => {
    await deleteScenarioVersion(scenarioId, version)
    cache.removeScenarioVersion(scenarioId, version)
    setRegistrySyncError(null)
  })
}

export async function syncSaveRiskRule(
  doc: RiskRuleConfigDocument,
  options?: { previousRuleId?: string },
): Promise<RiskRuleConfigDocument> {
  if (!isBackendActive()) {
    cache.upsertRiskRuleDocument(doc, options)
    return doc
  }

  return withBackendRollback(async () => {
    const saved = await saveRiskRuleDraft(doc, options)
    cache.upsertRiskRuleDocument(saved, options)
    setRegistrySyncError(null)
    return saved
  })
}

export async function syncSubmitScenarioReview(
  scenarioId: string,
  version: number,
  options?: { note?: string },
): Promise<ScenarioConfigDocument | null> {
  const existing = cache.getScenarioDocument(scenarioId, version)
  if (!existing) return null

  if (!isBackendActive()) {
    const updated = {
      ...existing,
      status: 'in_review' as const,
      updatedAt: new Date().toISOString(),
    }
    cache.upsertScenarioDocument(updated)
    return updated
  }

  return withBackendRollback(async () => {
    const updated = await submitScenarioReview(scenarioId, version, { note: options?.note })
    cache.upsertScenarioDocument(updated)
    await rehydrateCacheFromBackend()
    setRegistrySyncError(null)
    return updated
  })
}

export async function syncPublishRiskRule(
  ruleId: string,
  version: number,
  options?: { note?: string },
): Promise<RiskRuleConfigDocument | null> {
  const existing = cache.getRiskRuleDocument(ruleId, version)
  if (!existing) return null

  if (!isBackendActive()) {
    const published = {
      ...existing,
      status: 'published' as const,
      updatedAt: new Date().toISOString(),
    }
    cache.upsertRiskRuleDocument(published)
    return published
  }

  return withBackendRollback(async () => {
    const published = await publishRiskRuleVersion(ruleId, version, { note: options?.note })
    cache.upsertRiskRuleDocument(published)
    await rehydrateCacheFromBackend()
    setRegistrySyncError(null)
    return published
  })
}

export async function syncSubmitRiskRuleReview(
  ruleId: string,
  version: number,
  options?: { note?: string },
): Promise<RiskRuleConfigDocument | null> {
  const existing = cache.getRiskRuleDocument(ruleId, version)
  if (!existing) return null

  if (!isBackendActive()) {
    const updated = {
      ...existing,
      status: 'in_review' as const,
      updatedAt: new Date().toISOString(),
    }
    cache.upsertRiskRuleDocument(updated)
    return updated
  }

  return withBackendRollback(async () => {
    const updated = await submitRiskRuleReview(ruleId, version, { note: options?.note })
    cache.upsertRiskRuleDocument(updated)
    await rehydrateCacheFromBackend()
    setRegistrySyncError(null)
    return updated
  })
}

export async function syncFetchScenarioAudit(
  scenarioId: string,
  version?: number,
): Promise<AuditEvent[]> {
  if (!isBackendActive()) {
    return cache.listAuditEventsForEntity('scenario', scenarioId, version)
  }
  const response = await fetchScenarioAudit(scenarioId, version)
  return response.events
}

export async function syncFetchRiskRuleAudit(
  ruleId: string,
  version?: number,
): Promise<AuditEvent[]> {
  if (!isBackendActive()) {
    return cache.listAuditEventsForEntity('risk_rule', ruleId, version)
  }
  const response = await fetchRiskRuleAudit(ruleId, version)
  return response.events
}

export async function syncCreateRiskRuleDraft(
  base: RiskRuleConfigDocument,
): Promise<RiskRuleConfigDocument> {
  if (!isBackendActive()) {
    const versions = cache.listRiskRuleVersions(base.ruleId)
    const maxVersion = versions.reduce((m, v) => Math.max(m, v.version), 0)
    const now = new Date().toISOString()
    const draft: RiskRuleConfigDocument = {
      ...structuredClone(base),
      version: maxVersion + 1,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    }
    cache.upsertRiskRuleDocument(draft)
    return draft
  }

  return withBackendRollback(async () => {
    const draft = await createRiskRuleDraftVersion(base)
    cache.upsertRiskRuleDocument(draft)
    setRegistrySyncError(null)
    return draft
  })
}

export async function syncDeleteRiskRuleVersion(ruleId: string, version: number): Promise<void> {
  if (!isBackendActive()) {
    cache.removeRiskRuleVersion(ruleId, version)
    return
  }

  await withBackendRollback(async () => {
    await deleteRiskRuleVersion(ruleId, version)
    cache.removeRiskRuleVersion(ruleId, version)
    setRegistrySyncError(null)
  })
}
