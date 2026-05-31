import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { adminLoginPath } from '../../config'
import { ru } from '../../content/ru'
import { initAuthoringRegistry } from '../../registry/bootstrapRegistry'
import { useGovernanceStore } from './governanceStore'

export function AuthoringRouteGuard() {
  const location = useLocation()
  const status = useGovernanceStore((s) => s.status)
  const restoreSession = useGovernanceStore((s) => s.restoreSession)
  const canEdit = useGovernanceStore((s) => s.canEdit)

  useEffect(() => {
    if (status === 'idle') void restoreSession()
  }, [status, restoreSession])

  useEffect(() => {
    if (status === 'authenticated') void initAuthoringRegistry(true)
  }, [status])

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-slate-800">{ru.governance.sessionLoading}</p>
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to={adminLoginPath(location.pathname + location.search)} replace />
  }

  const isCreateRoute =
    location.pathname.endsWith('/new') || location.pathname.endsWith('/authoring/new')
  if (isCreateRoute && !canEdit()) {
    const listPath = location.pathname.includes('risk-authoring')
      ? '/risk-authoring'
      : '/authoring'
    return <Navigate to={listPath} replace state={{ accessDenied: 'create' }} />
  }

  return <Outlet />
}
