import { useEffect, useState } from 'react'
import { ru } from '../../content/ru'
import {
  getRegistryBootstrapState,
  pushLocalMigrationToBackend,
  refreshAuthoringRegistry,
  subscribeRegistryBootstrap,
} from '../../registry/bootstrapRegistry'
import { countLocalDocuments, loadLocalAuthoringSnapshot } from '../../registry/localStorageSnapshots'
import { useGovernanceStore } from '../../features/governance/governanceStore'
import { Button } from '../ui/Button'

export function RegistrySyncBanner() {
  const [boot, setBoot] = useState(getRegistryBootstrapState())
  const canImport = useGovernanceStore((s) => s.canImport())

  useEffect(() => subscribeRegistryBootstrap(() => setBoot(getRegistryBootstrapState())), [])

  if (boot.status === 'loading' || boot.status === 'idle') {
    return (
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        {ru.registry.loading}
      </div>
    )
  }

  if (boot.status === 'offline') {
    const localCount = countLocalDocuments(loadLocalAuthoringSnapshot())
    return (
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-medium">{ru.registry.offlineTitle}</p>
        <p className="mt-1 text-amber-900/90">
          {ru.registry.offlineDescription}
          {boot.error ? ` (${boot.error})` : ''}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => void refreshAuthoringRegistry()}>
            {ru.registry.retrySync}
          </Button>
          {localCount > 0 && canImport ? (
            <Button
              type="button"
              onClick={() => void pushLocalMigrationToBackend().then(() => refreshAuthoringRegistry())}
            >
              {ru.registry.migrateLocalCta}
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  if (boot.status === 'ready' && boot.source === 'backend' && boot.error) {
    return (
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-medium">{ru.registry.syncWarningTitle}</p>
        <p className="mt-1">{boot.error}</p>
        <Button
          type="button"
          variant="secondary"
          className="mt-3"
          onClick={() => void refreshAuthoringRegistry()}
        >
          {ru.registry.retrySync}
        </Button>
      </div>
    )
  }

  if (boot.status === 'error') {
    return (
      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        <p className="font-medium">{ru.registry.errorTitle}</p>
        <p className="mt-1">{boot.error ?? ru.registry.errorUnknown}</p>
        <Button
          type="button"
          variant="secondary"
          className="mt-3"
          onClick={() => void refreshAuthoringRegistry()}
        >
          {ru.registry.retrySync}
        </Button>
      </div>
    )
  }

  return null
}
