import { useGovernanceStore } from './governanceStore'

export function useGovernanceAccess() {
  const user = useGovernanceStore((s) => s.user)
  const canRead = useGovernanceStore((s) => s.canRead)
  const canEdit = useGovernanceStore((s) => s.canEdit)
  const canImport = useGovernanceStore((s) => s.canImport)
  const canExport = useGovernanceStore((s) => s.canExport)
  const canPublish = useGovernanceStore((s) => s.canPublish)
  const canDelete = useGovernanceStore((s) => s.canDelete)

  return {
    user,
    role: user?.role ?? null,
    canRead: canRead(),
    canEdit: canEdit(),
    canImport: canImport(),
    canExport: canExport(),
    canPublish: canPublish(),
    canDelete: canDelete(),
  }
}
