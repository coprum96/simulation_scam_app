const ROLE_PERMISSIONS = {
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

export function hasPermission(role, permission) {
  return (ROLE_PERMISSIONS[role] ?? []).includes(permission)
}

/** Resolve required permission for registry API call. null = public. */
export function permissionForRequest(method, pathname) {
  if (pathname === '/api/health') return null
  if (pathname.startsWith('/api/auth/')) return null
  if (pathname.startsWith('/api/archive/')) return null

  if (method === 'GET') return 'registry:read'

  if (method === 'POST' && pathname === '/api/registry/migrate') {
    return 'registry:import'
  }

  if (method === 'POST' && pathname.endsWith('/submit-review')) {
    return 'registry:write_draft'
  }

  if (method === 'POST' && pathname.endsWith('/publish')) {
    return 'registry:publish'
  }

  if (method === 'DELETE') return 'registry:delete'

  if (method === 'PUT') return 'registry:write_draft'

  if (method === 'POST') return 'registry:write_draft'

  return 'registry:read'
}

export function assertPermission(role, permission) {
  if (!hasPermission(role, permission)) {
    const error = new Error('forbidden')
    error.code = 'FORBIDDEN'
    throw error
  }
}
