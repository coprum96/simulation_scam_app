import { useEffect, type ReactNode } from 'react'
import { getStoredAuthToken } from '../features/governance/authStorage'
import { useGovernanceStore } from '../features/governance/governanceStore'
import { RegistrySyncBanner } from '../components/registry/RegistrySyncBanner'
import { bootstrapRegistryForApp } from '../registry/bootstrapRegistry'

type RegistryBootstrapProps = {
  children: ReactNode
}

export function RegistryBootstrap({ children }: RegistryBootstrapProps) {
  const govStatus = useGovernanceStore((s) => s.status)

  useEffect(() => {
    if (!getStoredAuthToken()) {
      void bootstrapRegistryForApp()
      return
    }
    if (govStatus === 'idle' || govStatus === 'loading') return
    void bootstrapRegistryForApp()
  }, [govStatus])

  return (
    <>
      <RegistrySyncBanner />
      {children}
    </>
  )
}
