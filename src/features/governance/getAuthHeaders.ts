import { getStoredAuthToken } from './authStorage'

export function getAuthRequestHeaders(): Record<string, string> {
  const token = getStoredAuthToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}
