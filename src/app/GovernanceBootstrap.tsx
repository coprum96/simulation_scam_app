import { useEffect, type ReactNode } from 'react'
import { setAuthTokenClearedHandler } from '../features/governance/authStorage'
import { useGovernanceStore } from '../features/governance/governanceStore'

type GovernanceBootstrapProps = {
  children: ReactNode
}

export function GovernanceBootstrap({ children }: GovernanceBootstrapProps) {
  const status = useGovernanceStore((s) => s.status)
  const restoreSession = useGovernanceStore((s) => s.restoreSession)

  useEffect(() => {
    if (status === 'idle') void restoreSession()
  }, [status, restoreSession])

  useEffect(() => {
    setAuthTokenClearedHandler(() => {
      useGovernanceStore.setState({
        status: 'anonymous',
        user: null,
        token: null,
        error: null,
      })
    })
    return () => setAuthTokenClearedHandler(null)
  }, [])

  return children
}
