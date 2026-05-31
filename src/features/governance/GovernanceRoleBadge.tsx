import { ru } from '../../content/ru'
import type { GovernanceRole } from '../../types/governance'

type GovernanceRoleBadgeProps = {
  role: GovernanceRole
}

export function GovernanceRoleBadge({ role }: GovernanceRoleBadgeProps) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      {ru.governance.roles[role]}
    </span>
  )
}
