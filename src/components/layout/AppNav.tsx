import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../config'
import { ru } from '../../content/ru'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-teal-700 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

type NavItemProps = {
  to: string
  end?: boolean
  label: string
  title: string
}

function NavItem({ to, end, label, title }: NavItemProps) {
  return (
    <NavLink to={to} end={end} className={linkClass} title={title}>
      {label}
    </NavLink>
  )
}

export function AppNav() {
  return (
    <nav className="flex flex-col gap-3 sm:items-end" aria-label={ru.nav.ariaLabel}>
      <div className="flex flex-wrap items-center gap-1 sm:justify-end">
        <span className="mr-1 hidden text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:inline">
          {ru.nav.groupStudy}
        </span>
        <NavItem
          to={ROUTES.scenarios}
          end
          label={ru.nav.simulations}
          title={ru.nav.simulationsHelp}
        />
        <NavItem to={ROUTES.dashboard} label={ru.nav.analytics} title={ru.nav.analyticsHelp} />
      </div>
      <div className="flex flex-wrap items-center gap-1 sm:justify-end">
        <span className="mr-1 hidden text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:inline">
          {ru.nav.groupContent}
        </span>
        <NavItem
          to={ROUTES.authoring}
          label={ru.nav.scenarioContent}
          title={ru.nav.scenarioContentHelp}
        />
        <NavItem
          to={ROUTES.riskAuthoring}
          label={ru.nav.riskRules}
          title={ru.nav.riskRulesHelp}
        />
      </div>
    </nav>
  )
}
