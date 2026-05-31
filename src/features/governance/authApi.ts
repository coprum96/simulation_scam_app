import { REGISTRY_API_BASE } from '../../registry/config'
import { RegistryApiError } from '../../registry/apiClient'
import type { AuthSession } from '../../types/governance'
import { getAuthRequestHeaders } from './getAuthHeaders'

async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${REGISTRY_API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthRequestHeaders(),
      ...(init?.headers ?? {}),
    },
  })
  if (!response.ok) {
    let message = response.statusText
    try {
      const body = (await response.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      // ignore
    }
    throw new RegistryApiError(response.status, message)
  }
  return (await response.json()) as T
}

export async function loginRequest(
  username: string,
  password: string,
): Promise<AuthSession> {
  const response = await fetch(`${REGISTRY_API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!response.ok) {
    throw new RegistryApiError(response.status, 'invalid_credentials')
  }
  return (await response.json()) as AuthSession
}

export async function logoutRequest(): Promise<void> {
  try {
    await authRequest('/api/auth/logout', { method: 'POST' })
  } catch {
    // ignore
  }
}

export async function fetchCurrentUser(): Promise<AuthSession> {
  return authRequest<AuthSession>('/api/auth/me')
}
