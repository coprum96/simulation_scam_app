import { NavLink, Outlet } from 'react-router-dom'
import { APP_NAME, adminLoginPath } from '../config'
import { ru } from '../content/ru'
import { AppNav } from '../components/layout/AppNav'
import { GovernanceRoleBadge } from '../features/governance/GovernanceRoleBadge'
import { useGovernanceStore } from '../features/governance/governanceStore'

export function AppLayout() {
  const status = useGovernanceStore((s) => s.status)
  const user = useGovernanceStore((s) => s.user)
  const logout = useGovernanceStore((s) => s.logout)

  const authenticated = status === 'authenticated' && user

  return (
    <div className="min-h-screen bg-[#f6f8f7]">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-tight text-slate-900">{APP_NAME}</p>
            <p className="mt-0.5 text-sm text-slate-600">{ru.app.subtitle}</p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            {authenticated ? (
              <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-slate-600">
                <span>
                  {ru.governance.currentUserLabel}:{' '}
                  <span className="font-medium text-slate-900">{user.displayName}</span>
                </span>
                <GovernanceRoleBadge role={user.role} />
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-50"
                  onClick={() => void logout()}
                >
                  {ru.nav.adminLogout}
                </button>
              </div>
            ) : (
              <NavLink
                to={adminLoginPath()}
                className="self-end text-xs font-medium text-teal-800 hover:underline"
              >
                {ru.nav.adminLogin}
              </NavLink>
            )}
            <AppNav />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
