export const ROUTES = {
  scenarios: '/',
  dashboard: '/dashboard',
  adminLogin: '/admin/login',
  authoring: '/authoring',
  authoringNew: '/authoring/new',
  authoringEdit: '/authoring/:scenarioId',
  riskAuthoring: '/risk-authoring',
  riskAuthoringNew: '/risk-authoring/new',
  riskAuthoringEdit: '/risk-authoring/:ruleId',
  banking: '/banking/:scenarioId',
  wallet: '/wallet/:scenarioId',
  sessionReplay: '/sessions/:sessionId',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

export function bankingPath(scenarioId: string): string {
  return `/banking/${scenarioId}`
}

export function walletPath(scenarioId: string): string {
  return `/wallet/${scenarioId}`
}

export function sessionReplayPath(sessionId: string): string {
  return `/sessions/${sessionId}`
}

export function adminLoginPath(returnTo?: string): string {
  if (!returnTo) return ROUTES.adminLogin
  return `${ROUTES.adminLogin}?returnTo=${encodeURIComponent(returnTo)}`
}

export function authoringListPath(): string {
  return ROUTES.authoring
}

export function authoringNewPath(simulator?: 'banking' | 'wallet'): string {
  if (!simulator) return ROUTES.authoringNew
  return `${ROUTES.authoringNew}?simulator=${simulator}`
}

export function authoringEditPath(
  scenarioId: string,
  options?: { version?: number; clone?: boolean },
): string {
  const params = new URLSearchParams()
  if (options?.version) params.set('version', String(options.version))
  if (options?.clone) params.set('clone', 'true')
  const query = params.toString()
  return `/authoring/${encodeURIComponent(scenarioId)}${query ? `?${query}` : ''}`
}

export function riskRuleAuthoringListPath(): string {
  return ROUTES.riskAuthoring
}

export function riskRuleAuthoringNewPath(options?: { clone?: boolean; id?: string }): string {
  const params = new URLSearchParams()
  if (options?.clone) params.set('clone', 'true')
  if (options?.id) params.set('id', options.id)
  const query = params.toString()
  return `${ROUTES.riskAuthoringNew}${query ? `?${query}` : ''}`
}

export function riskRuleAuthoringEditPath(
  ruleId: string,
  options?: { version?: number; clone?: boolean; id?: string },
): string {
  const params = new URLSearchParams()
  if (options?.version) params.set('version', String(options.version))
  if (options?.clone) params.set('clone', 'true')
  if (options?.id) params.set('id', options.id)
  const query = params.toString()
  return `/risk-authoring/${encodeURIComponent(ruleId)}${query ? `?${query}` : ''}`
}
