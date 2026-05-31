import { create } from 'zustand'
import type { AuditEvent } from '../../types/audit'
import type { ScenarioConfigDocument } from '../../types/scenarioConfig'
import {
  getRegistryBootstrapState,
  initAuthoringRegistry,
  refreshAuthoringRegistry,
} from '../../registry/bootstrapRegistry'
import {
  syncCreateScenarioDraft,
  syncDeleteScenarioVersion,
  syncFetchScenarioAudit,
  syncPublishScenario,
  syncSaveScenario,
  syncSubmitScenarioReview,
} from '../../registry/registrySync'
import * as cache from '../../registry/registryCache'
import { listBuiltinScenarioIds } from './builtinScenarioToConfig'
import { validateScenarioConfigFull } from './validateScenarioConfigFull'

type ScenarioAuthoringStoreState = {
  refreshKey: number
  registryStatus: ReturnType<typeof getRegistryBootstrapState>['status']
  registrySource: ReturnType<typeof getRegistryBootstrapState>['source']
  registryError: string | null
  refresh: () => void
  ensureRegistry: () => Promise<void>
  reloadRegistry: () => Promise<void>
  listScenarioIds: () => string[]
  listVersions: (scenarioId: string) => ScenarioConfigDocument[]
  getDocument: (scenarioId: string, version: number) => ScenarioConfigDocument | undefined
  saveDocument: (
    doc: ScenarioConfigDocument,
    options?: { previousScenarioId?: string },
  ) => Promise<void>
  publishDocument: (
    scenarioId: string,
    version: number,
    options?: { note?: string },
  ) => Promise<ScenarioConfigDocument | null>
  submitForReview: (
    scenarioId: string,
    version: number,
    options?: { note?: string },
  ) => Promise<ScenarioConfigDocument | null>
  fetchAuditTrail: (scenarioId: string, version?: number) => Promise<AuditEvent[]>
  createDraftFromVersion: (base: ScenarioConfigDocument) => Promise<ScenarioConfigDocument>
  deleteVersion: (scenarioId: string, version: number) => Promise<void>
  importDocuments: (documents: ScenarioConfigDocument[]) => Promise<void>
}

function syncRegistryFlags(set: (fn: (s: ScenarioAuthoringStoreState) => Partial<ScenarioAuthoringStoreState>) => void): void {
  const boot = getRegistryBootstrapState()
  set(() => ({
    registryStatus: boot.status,
    registrySource: boot.source,
    registryError: boot.error,
  }))
}

export const useScenarioAuthoringStore = create<ScenarioAuthoringStoreState>((set, get) => ({
  refreshKey: 0,
  registryStatus: 'idle',
  registrySource: null,
  registryError: null,
  refresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
  ensureRegistry: async () => {
    await initAuthoringRegistry()
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
  },
  reloadRegistry: async () => {
    await refreshAuthoringRegistry()
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
  },
  listScenarioIds: () => {
    void get().refreshKey
    return cache.listScenarioIds()
  },
  listVersions: (scenarioId) => {
    void get().refreshKey
    return cache.listScenarioVersions(scenarioId)
  },
  getDocument: (scenarioId, version) => {
    void get().refreshKey
    return cache.getScenarioDocument(scenarioId, version)
  },
  saveDocument: async (doc, options) => {
    await syncSaveScenario(doc, options)
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
  },
  publishDocument: async (scenarioId, version, options) => {
    const doc = cache.getScenarioDocument(scenarioId, version)
    if (!doc) return null
    const validation = validateScenarioConfigFull(doc, [
      ...cache.listScenarioIds(),
      ...listBuiltinScenarioIds(),
    ])
    if (!validation.canPublish) return null
    const published = await syncPublishScenario(scenarioId, version, options)
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
    return published
  },
  submitForReview: async (scenarioId, version, options) => {
    const updated = await syncSubmitScenarioReview(scenarioId, version, options)
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
    return updated
  },
  fetchAuditTrail: async (scenarioId, version) => syncFetchScenarioAudit(scenarioId, version),
  createDraftFromVersion: async (base) => {
    const draft = await syncCreateScenarioDraft(base)
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
    return draft
  },
  deleteVersion: async (scenarioId, version) => {
    await syncDeleteScenarioVersion(scenarioId, version)
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
  },
  importDocuments: async (documents) => {
    for (const doc of documents) {
      await syncSaveScenario(doc)
    }
    syncRegistryFlags(set)
    set((s) => ({ refreshKey: s.refreshKey + 1 }))
  },
}))
