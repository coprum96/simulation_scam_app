import { create } from 'zustand'
import type { AuditEvent } from '../../types/audit'
import type { RiskRuleConfigDocument } from '../../types/riskRuleConfig'
import {
  getRegistryBootstrapState,
  initAuthoringRegistry,
  refreshAuthoringRegistry,
} from '../../registry/bootstrapRegistry'
import * as cache from '../../registry/registryCache'
import {
  syncCreateRiskRuleDraft,
  syncDeleteRiskRuleVersion,
  syncFetchRiskRuleAudit,
  syncPublishRiskRule,
  syncSaveRiskRule,
  syncSubmitRiskRuleReview,
} from '../../registry/registrySync'
import { normalizeRiskRuleConfig } from './normalizeRiskRuleConfig'
import { validateRiskRuleConfig } from './validateRiskRuleConfig'

type RiskRuleAuthoringStoreState = {
  refreshKey: number
  registryStatus: ReturnType<typeof getRegistryBootstrapState>['status']
  registrySource: ReturnType<typeof getRegistryBootstrapState>['source']
  registryError: string | null
  refresh: () => void
  ensureRegistry: () => Promise<void>
  reloadRegistry: () => Promise<void>
  listRuleIds: () => string[]
  listVersions: (ruleId: string) => RiskRuleConfigDocument[]
  getDocument: (ruleId: string, version: number) => RiskRuleConfigDocument | undefined
  saveDocument: (
    doc: RiskRuleConfigDocument,
    options?: { previousRuleId?: string },
  ) => Promise<void>
  publishDocument: (
    ruleId: string,
    version: number,
    options?: { note?: string },
  ) => Promise<RiskRuleConfigDocument | null>
  submitForReview: (
    ruleId: string,
    version: number,
    options?: { note?: string },
  ) => Promise<RiskRuleConfigDocument | null>
  fetchAuditTrail: (ruleId: string, version?: number) => Promise<AuditEvent[]>
  createDraftFromVersion: (base: RiskRuleConfigDocument) => Promise<RiskRuleConfigDocument>
  deleteVersion: (ruleId: string, version: number) => Promise<void>
  importDocuments: (documents: RiskRuleConfigDocument[]) => Promise<void>
}

function syncRegistryFlags(set: (fn: (s: RiskRuleAuthoringStoreState) => Partial<RiskRuleAuthoringStoreState>) => void): void {
  const boot = getRegistryBootstrapState()
  set(() => ({
    registryStatus: boot.status,
    registrySource: boot.source,
    registryError: boot.error,
  }))
}

export const useRiskRuleAuthoringStore = create<RiskRuleAuthoringStoreState>((set, get) => ({
  refreshKey: 0,
  registryStatus: 'idle',
  registrySource: null,
  registryError: null,
  refresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
  ensureRegistry: async () => {
    const boot = getRegistryBootstrapState()
    if (boot.status === 'ready' || boot.status === 'offline') {
      syncRegistryFlags(set)
      return
    }
    await initAuthoringRegistry()
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
  },
  reloadRegistry: async () => {
    await refreshAuthoringRegistry()
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
  },
  listRuleIds: () => {
    void get().refreshKey
    return cache.listRuleIds()
  },
  listVersions: (ruleId) => {
    void get().refreshKey
    return cache.listRiskRuleVersions(ruleId)
  },
  getDocument: (ruleId, version) => {
    void get().refreshKey
    return cache.getRiskRuleDocument(ruleId, version)
  },
  saveDocument: async (doc, options) => {
    const normalized = normalizeRiskRuleConfig(doc)
    await syncSaveRiskRule(normalized, options)
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
  },
  publishDocument: async (ruleId, version, options) => {
    const doc = cache.getRiskRuleDocument(ruleId, version)
    if (!doc) return null
    const validation = validateRiskRuleConfig(doc, {
      forPublish: true,
      allowBuiltinOverride: true,
    })
    if (!validation.canPublish) return null
    const published = await syncPublishRiskRule(ruleId, version, options)
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
    return published
  },
  submitForReview: async (ruleId, version, options) => {
    const updated = await syncSubmitRiskRuleReview(ruleId, version, options)
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
    return updated
  },
  fetchAuditTrail: async (ruleId, version) => syncFetchRiskRuleAudit(ruleId, version),
  createDraftFromVersion: async (base) => {
    const draft = await syncCreateRiskRuleDraft(base)
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
    return draft
  },
  deleteVersion: async (ruleId, version) => {
    await syncDeleteRiskRuleVersion(ruleId, version)
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
  },
  importDocuments: async (documents) => {
    for (const doc of documents) {
      await syncSaveRiskRule(normalizeRiskRuleConfig(doc))
    }
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
  },
}))
