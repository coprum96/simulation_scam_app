import { clearStoredAuthToken } from '../features/governance/authStorage'
import { getAuthRequestHeaders } from '../features/governance/getAuthHeaders'
import type { AuditEventListResponse, PublishNotePayload } from '../types/audit'
import { REGISTRY_API_BASE } from './config'
import type { RegistryMigratePayload, RegistrySnapshot } from './types'
import type { RiskRuleConfigDocument } from '../types/riskRuleConfig'
import type { ScenarioConfigDocument } from '../types/scenarioConfig'

export class RegistryApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'RegistryApiError'
    this.status = status
  }
}

const REGISTRY_FETCH_TIMEOUT_MS = 20_000

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${REGISTRY_API_BASE}${path}`
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REGISTRY_FETCH_TIMEOUT_MS)
  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthRequestHeaders(),
        ...(init?.headers ?? {}),
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new RegistryApiError(0, 'request_timeout')
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
  if (!response.ok) {
    let message = response.statusText
    try {
      const body = (await response.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      // ignore
    }
    if (response.status === 401 && typeof window !== 'undefined') {
      clearStoredAuthToken()
    }
    throw new RegistryApiError(response.status, message)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export async function fetchRegistryHealth(): Promise<boolean> {
  try {
    const result = await request<{ ok: boolean }>('/api/health')
    return result.ok === true
  } catch {
    return false
  }
}

export async function fetchRegistrySnapshot(): Promise<RegistrySnapshot> {
  return request<RegistrySnapshot>('/api/registry')
}

export async function migrateRegistry(payload: RegistryMigratePayload): Promise<RegistrySnapshot> {
  return request<RegistrySnapshot>('/api/registry/migrate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function saveScenarioDraft(
  doc: ScenarioConfigDocument,
  options?: { previousScenarioId?: string },
): Promise<ScenarioConfigDocument> {
  const params = new URLSearchParams()
  if (options?.previousScenarioId) params.set('previousScenarioId', options.previousScenarioId)
  const query = params.toString()
  return request<ScenarioConfigDocument>(
    `/api/scenarios/${encodeURIComponent(doc.scenarioId)}/versions/${doc.version}${query ? `?${query}` : ''}`,
    { method: 'PUT', body: JSON.stringify(doc) },
  )
}

export async function publishScenarioVersion(
  scenarioId: string,
  version: number,
  payload?: PublishNotePayload,
): Promise<ScenarioConfigDocument> {
  return request<ScenarioConfigDocument>(
    `/api/scenarios/${encodeURIComponent(scenarioId)}/versions/${version}/publish`,
    { method: 'POST', body: JSON.stringify(payload ?? {}) },
  )
}

export async function submitScenarioReview(
  scenarioId: string,
  version: number,
  payload?: PublishNotePayload,
): Promise<ScenarioConfigDocument> {
  return request<ScenarioConfigDocument>(
    `/api/scenarios/${encodeURIComponent(scenarioId)}/versions/${version}/submit-review`,
    { method: 'POST', body: JSON.stringify(payload ?? {}) },
  )
}

export async function fetchScenarioAudit(
  scenarioId: string,
  version?: number,
): Promise<AuditEventListResponse> {
  const query = version != null ? `?version=${version}` : ''
  return request<AuditEventListResponse>(
    `/api/scenarios/${encodeURIComponent(scenarioId)}/audit${query}`,
  )
}

export async function createScenarioDraftVersion(
  base: ScenarioConfigDocument,
): Promise<ScenarioConfigDocument> {
  return request<ScenarioConfigDocument>(
    `/api/scenarios/${encodeURIComponent(base.scenarioId)}/versions`,
    { method: 'POST', body: JSON.stringify(base) },
  )
}

export async function deleteScenarioVersion(scenarioId: string, version: number): Promise<void> {
  await request(`/api/scenarios/${encodeURIComponent(scenarioId)}/versions/${version}`, {
    method: 'DELETE',
  })
}

export async function saveRiskRuleDraft(
  doc: RiskRuleConfigDocument,
  options?: { previousRuleId?: string },
): Promise<RiskRuleConfigDocument> {
  const params = new URLSearchParams()
  if (options?.previousRuleId) params.set('previousRuleId', options.previousRuleId)
  const query = params.toString()
  return request<RiskRuleConfigDocument>(
    `/api/risk-rules/${encodeURIComponent(doc.ruleId)}/versions/${doc.version}${query ? `?${query}` : ''}`,
    { method: 'PUT', body: JSON.stringify(doc) },
  )
}

export async function publishRiskRuleVersion(
  ruleId: string,
  version: number,
  payload?: PublishNotePayload,
): Promise<RiskRuleConfigDocument> {
  return request<RiskRuleConfigDocument>(
    `/api/risk-rules/${encodeURIComponent(ruleId)}/versions/${version}/publish`,
    { method: 'POST', body: JSON.stringify(payload ?? {}) },
  )
}

export async function submitRiskRuleReview(
  ruleId: string,
  version: number,
  payload?: PublishNotePayload,
): Promise<RiskRuleConfigDocument> {
  return request<RiskRuleConfigDocument>(
    `/api/risk-rules/${encodeURIComponent(ruleId)}/versions/${version}/submit-review`,
    { method: 'POST', body: JSON.stringify(payload ?? {}) },
  )
}

export async function fetchRiskRuleAudit(
  ruleId: string,
  version?: number,
): Promise<AuditEventListResponse> {
  const query = version != null ? `?version=${version}` : ''
  return request<AuditEventListResponse>(
    `/api/risk-rules/${encodeURIComponent(ruleId)}/audit${query}`,
  )
}

export async function createRiskRuleDraftVersion(
  base: RiskRuleConfigDocument,
): Promise<RiskRuleConfigDocument> {
  return request<RiskRuleConfigDocument>(
    `/api/risk-rules/${encodeURIComponent(base.ruleId)}/versions`,
    { method: 'POST', body: JSON.stringify(base) },
  )
}

export async function deleteRiskRuleVersion(ruleId: string, version: number): Promise<void> {
  await request(`/api/risk-rules/${encodeURIComponent(ruleId)}/versions/${version}`, {
    method: 'DELETE',
  })
}
