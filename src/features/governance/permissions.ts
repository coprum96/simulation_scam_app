import type { GovernancePermission, GovernanceRole } from '../../types/governance'

const ROLE_PERMISSIONS: Record<GovernanceRole, GovernancePermission[]> = {
  viewer: ['registry:read'],
  editor: ['registry:read', 'registry:write_draft', 'registry:import'],
  publisher: [
    'registry:read',
    'registry:write_draft',
    'registry:import',
    'registry:publish',
    'registry:delete',
  ],
}

export function roleHasPermission(role: GovernanceRole, permission: GovernancePermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function canReadRegistry(role: GovernanceRole): boolean {
  return roleHasPermission(role, 'registry:read')
}

export function canWriteDraft(role: GovernanceRole): boolean {
  return roleHasPermission(role, 'registry:write_draft')
}

export function canImportRegistry(role: GovernanceRole): boolean {
  return roleHasPermission(role, 'registry:import')
}

export function canPublishRegistry(role: GovernanceRole): boolean {
  return roleHasPermission(role, 'registry:publish')
}

export function canDeleteRegistryVersion(role: GovernanceRole): boolean {
  return roleHasPermission(role, 'registry:delete')
}

export function canExportRegistry(role: GovernanceRole): boolean {
  return canReadRegistry(role)
}
