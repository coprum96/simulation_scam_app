import { useEffect, useState, type ReactNode } from 'react'
import { ru } from '../content/ru'
import { RegistrySyncBanner } from '../components/registry/RegistrySyncBanner'
import {
  bootstrapRegistryForApp,
  getRegistryBootstrapState,
  subscribeRegistryBootstrap,
} from '../registry/bootstrapRegistry'

type RegistryBootstrapProps = {
  children: ReactNode
}

export function RegistryBootstrap({ children }: RegistryBootstrapProps) {
  const [boot, setBoot] = useState(getRegistryBootstrapState())

  useEffect(() => {
    return subscribeRegistryBootstrap(() => setBoot(getRegistryBootstrapState()))
  }, [])

  useEffect(() => {
    void bootstrapRegistryForApp()
  }, [])

  const blocking = boot.status === 'idle' || boot.status === 'loading'

  if (blocking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f4faf8] text-center">
        <p className="text-sm font-medium text-slate-800">{ru.registry.appLoadingTitle}</p>
        <p className="max-w-md text-sm text-slate-500">{ru.registry.appLoadingDescription}</p>
      </div>
    )
  }

  return (
    <>
      <RegistrySyncBanner />
      {children}
    </>
  )
}
