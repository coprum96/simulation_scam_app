const AUTH_TOKEN_KEY = 'scam_app_ru.governance.token.v1'

let onTokenCleared: (() => void) | null = null

export function setAuthTokenClearedHandler(handler: (() => void) | null): void {
  onTokenCleared = handler
}

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setStoredAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearStoredAuthToken(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  onTokenCleared?.()
}
