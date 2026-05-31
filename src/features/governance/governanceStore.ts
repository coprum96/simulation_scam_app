import { create } from 'zustand'
import type { AuthSession, GovernanceRole, GovernanceUser } from '../../types/governance'
import {
  canDeleteRegistryVersion,
  canExportRegistry,
  canImportRegistry,
  canPublishRegistry,
  canReadRegistry,
  canWriteDraft,
} from './permissions'
import { clearStoredAuthToken, getStoredAuthToken, setStoredAuthToken } from './authStorage'
import { fetchCurrentUser, loginRequest, logoutRequest } from './authApi'

type GovernanceStoreState = {
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous'
  user: GovernanceUser | null
  token: string | null
  error: string | null
  restoreSession: () => Promise<void>
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  canRead: () => boolean
  canEdit: () => boolean
  canImport: () => boolean
  canExport: () => boolean
  canPublish: () => boolean
  canDelete: () => boolean
}

function permissionsFromRole(role: GovernanceRole | null) {
  if (!role) {
    return {
      read: false,
      edit: false,
      import: false,
      export: false,
      publish: false,
      delete: false,
    }
  }
  return {
    read: canReadRegistry(role),
    edit: canWriteDraft(role),
    import: canImportRegistry(role),
    export: canExportRegistry(role),
    publish: canPublishRegistry(role),
    delete: canDeleteRegistryVersion(role),
  }
}

export const useGovernanceStore = create<GovernanceStoreState>((set, get) => ({
  status: 'idle',
  user: null,
  token: null,
  error: null,

  restoreSession: async () => {
    const token = getStoredAuthToken()
    if (!token) {
      set({ status: 'anonymous', user: null, token: null, error: null })
      return
    }
    set({ status: 'loading', error: null })
    try {
      const session = await fetchCurrentUser()
      setStoredAuthToken(session.token)
      set({
        status: 'authenticated',
        user: session.user,
        token: session.token,
        error: null,
      })
    } catch {
      clearStoredAuthToken()
      set({ status: 'anonymous', user: null, token: null, error: null })
    }
  },

  login: async (username, password) => {
    set({ status: 'loading', error: null })
    try {
      const session: AuthSession = await loginRequest(username, password)
      setStoredAuthToken(session.token)
      set({
        status: 'authenticated',
        user: session.user,
        token: session.token,
        error: null,
      })
      return true
    } catch {
      set({
        status: 'anonymous',
        user: null,
        token: null,
        error: 'invalid_credentials',
      })
      return false
    }
  },

  logout: async () => {
    const token = get().token
    if (token) await logoutRequest()
    clearStoredAuthToken()
    set({ status: 'anonymous', user: null, token: null, error: null })
  },

  canRead: () => permissionsFromRole(get().user?.role ?? null).read,
  canEdit: () => permissionsFromRole(get().user?.role ?? null).edit,
  canImport: () => permissionsFromRole(get().user?.role ?? null).import,
  canExport: () => permissionsFromRole(get().user?.role ?? null).export,
  canPublish: () => permissionsFromRole(get().user?.role ?? null).publish,
  canDelete: () => permissionsFromRole(get().user?.role ?? null).delete,
}))
