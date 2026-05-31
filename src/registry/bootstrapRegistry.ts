import { getStoredAuthToken } from '../features/governance/authStorage'
import { REGISTRY_MIGRATED_FLAG_KEY } from './config'
import {
  fetchRegistryHealth,
  fetchRegistrySnapshot,
  migrateRegistry,
  RegistryApiError,
} from './apiClient'
import {
  countLocalDocuments,
  loadLocalAuthoringSnapshot,
} from './localStorageSnapshots'
import * as cache from './registryCache'
import { sanitizeRegistrySnapshot } from './sanitizeRegistrySnapshot'
import type { RegistryDataSource, RegistrySyncStatus } from './types'

export type RegistryBootstrapState = {
  status: RegistrySyncStatus
  source: RegistryDataSource
  error: string | null
  lastSyncedAt: number | null
}

let state: RegistryBootstrapState = {
  status: 'idle',
  source: null,
  error: null,
  lastSyncedAt: null,
}

const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

export function getRegistryBootstrapState(): RegistryBootstrapState {
  return state
}

export function subscribeRegistryBootstrap(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function setState(patch: Partial<RegistryBootstrapState>): void {
  state = { ...state, ...patch }
  emit()
}

export function setRegistrySyncError(message: string | null): void {
  if (message) {
    setState({ error: message })
    return
  }
  if (state.error) setState({ error: null })
}

function hasMigratedFlag(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(REGISTRY_MIGRATED_FLAG_KEY) === '1'
}

function markMigratedFlag(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(REGISTRY_MIGRATED_FLAG_KEY, '1')
}

function hydrateFromLocal(): void {
  const local = loadLocalAuthoringSnapshot()
  cache.hydrateRegistryCache(sanitizeRegistrySnapshot({
    schemaVersion: 1,
    scenarios: local.scenarios,
    riskRules: local.riskRules,
  }))
}

let initPromise: Promise<void> | null = null
let initGeneration = 0

function hydrateLocalReady(): void {
  hydrateFromLocal()
  setState({
    status: 'ready',
    source: 'local',
    error: null,
    lastSyncedAt: Date.now(),
  })
}

/** Public app shell: local cache only unless a governance token is present. */
export async function bootstrapRegistryForApp(): Promise<void> {
  if (!getStoredAuthToken()) {
    hydrateLocalReady()
    return
  }
  await initAuthoringRegistry()
}

export async function initAuthoringRegistry(force = false): Promise<void> {
  if (!force && state.status === 'ready' && state.source === 'backend') return
  if (!force && initPromise) return initPromise

  const generation = ++initGeneration
  const backgroundRefresh = force && state.status === 'ready'

  initPromise = (async () => {
    if (!backgroundRefresh) {
      setState({ status: 'loading', error: null })
    }

    const healthy = await fetchRegistryHealth()
    if (generation !== initGeneration) return
    if (!healthy) {
      hydrateFromLocal()
      if (generation !== initGeneration) return
      setState({
        status: 'offline',
        source: 'local',
        error: null,
        lastSyncedAt: Date.now(),
      })
      return
    }

    try {
      let snapshot = sanitizeRegistrySnapshot(await fetchRegistrySnapshot())
      if (generation !== initGeneration) return
      cache.hydrateRegistryCache(snapshot)

      if (!hasMigratedFlag()) {
        const local = loadLocalAuthoringSnapshot()
        if (countLocalDocuments(local) > 0) {
          snapshot = sanitizeRegistrySnapshot(await migrateRegistry(local))
          if (generation !== initGeneration) return
          cache.hydrateRegistryCache(snapshot)
        }
        markMigratedFlag()
      }

      if (generation !== initGeneration) return
      setState({
        status: 'ready',
        source: 'backend',
        error: null,
        lastSyncedAt: Date.now(),
      })
    } catch (error) {
      hydrateFromLocal()
      const message =
        error instanceof RegistryApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'registry_error'
      if (generation !== initGeneration) return
      setState({
        status: 'offline',
        source: 'local',
        error: message,
        lastSyncedAt: Date.now(),
      })
    }
  })()

  try {
    await initPromise
  } finally {
    if (force) initPromise = null
    else if (state.status !== 'loading') initPromise = null
  }
}

export async function refreshAuthoringRegistry(): Promise<void> {
  initPromise = null
  await initAuthoringRegistry(true)
}

export async function pushLocalMigrationToBackend(): Promise<boolean> {
  const local = loadLocalAuthoringSnapshot()
  if (countLocalDocuments(local) === 0) return false
  try {
    const merged = sanitizeRegistrySnapshot(await migrateRegistry(local))
    cache.hydrateRegistryCache(merged)
    markMigratedFlag()
    setState({
      status: 'ready',
      source: 'backend',
      error: null,
      lastSyncedAt: Date.now(),
    })
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : 'migration_failed'
    setState({ error: message })
    return false
  }
}
