export const GOVERNANCE_ROLES = ['viewer', 'editor', 'publisher'] as const
export type GovernanceRole = (typeof GOVERNANCE_ROLES)[number]

export type GovernanceUser = {
  id: string
  username: string
  displayName: string
  role: GovernanceRole
}

export type AuthSession = {
  token: string
  user: GovernanceUser
  expiresAt: string
}

export const GOVERNANCE_PERMISSIONS = [
  'registry:read',
  'registry:write_draft',
  'registry:import',
  'registry:publish',
  'registry:delete',
] as const

export type GovernancePermission = (typeof GOVERNANCE_PERMISSIONS)[number]
