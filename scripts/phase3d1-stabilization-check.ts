/**
 * Phase 3D.1 stabilization checks. Run: npm run dev:registry && npx tsx scripts/phase3d1-stabilization-check.ts
 */
import { mockScenarios } from '../src/data/scenariosCatalog'
import { listRuntimeScenarios } from '../src/data/scenarioRegistry'
import { createDefaultScenarioConfig } from '../src/features/scenario-authoring/defaultScenarioTemplate'
import { builtinRiskRuleToConfig } from '../src/features/risk-rule-authoring/builtinRiskRuleToConfig'
import { getRuntimeRiskRules } from '../src/features/risk-engine/riskRuleRegistry'
import {
  hydrateRegistryCache,
  listPublishedRiskRuleConfigs,
  listPublishedScenarioConfigs,
  upsertRiskRuleDocument,
} from '../src/registry/registryCache'
import { sanitizeRegistrySnapshot } from '../src/registry/sanitizeRegistrySnapshot'

const REGISTRY_BASE = process.env.REGISTRY_TEST_URL ?? 'http://localhost:3001'

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

async function loginPublisher(): Promise<string> {
  const response = await fetch(`${REGISTRY_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'publisher', password: 'publisher' }),
  })
  if (!response.ok) throw new Error('login publisher failed')
  const session = (await response.json()) as { token: string }
  return session.token
}

let publisherToken: string | null = null

async function api<T>(pathname: string, init?: RequestInit): Promise<T> {
  if (!publisherToken) publisherToken = await loginPublisher()
  const response = await fetch(`${REGISTRY_BASE}${pathname}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publisherToken}`,
      ...(init?.headers ?? {}),
    },
  })
  if (!response.ok) throw new Error(`${pathname} failed: ${response.status}`)
  return (await response.json()) as T
}

function resetCache(): void {
  hydrateRegistryCache({ schemaVersion: 1, scenarios: {}, riskRules: {} })
}

async function testHealthAndSnapshot(): Promise<void> {
  const health = await api<{ ok: boolean }>('/api/health')
  assert(health.ok, 'health ok')
  const snapshot = await api<{ scenarios: Record<string, unknown[]> }>('/api/registry')
  assert(snapshot.scenarios !== undefined, 'registry snapshot')
}

async function testScenarioCrudAndDelete(): Promise<void> {
  const doc = createDefaultScenarioConfig('registry_api_test', 'banking')
  doc.metadata.title = 'Registry test'
  doc.metadata.description = 'Desc'
  doc.metadata.expectedRiskFlags = ['ignored_warning']
  doc.metadata.targetProfileIds = ['normal_user']

  await api(`/api/scenarios/${doc.scenarioId}/versions/${doc.version}`, {
    method: 'PUT',
    body: JSON.stringify(doc),
  })
  const published = await api<typeof doc>(
    `/api/scenarios/${doc.scenarioId}/versions/${doc.version}/publish`,
    { method: 'POST' },
  )
  assert(published.status === 'published', 'scenario published')

  resetCache()
  const snapshot = await api<{ scenarios: Record<string, typeof doc[]> }>('/api/registry')
  hydrateRegistryCache(sanitizeRegistrySnapshot(snapshot))
  assert(
    listPublishedScenarioConfigs().some((d) => d.scenarioId === doc.scenarioId),
    'cache has published scenario after hydrate',
  )
  assert(
    listRuntimeScenarios().some((s) => s.id === doc.scenarioId),
    'hub runtime includes published scenario',
  )

  await api(`/api/scenarios/${doc.scenarioId}/versions/${doc.version}`, { method: 'DELETE' })
  resetCache()
  const afterDelete = await api<{ scenarios: Record<string, typeof doc[]> }>('/api/registry')
  hydrateRegistryCache(sanitizeRegistrySnapshot(afterDelete))
  assert(
    !listPublishedScenarioConfigs().some((d) => d.scenarioId === doc.scenarioId),
    'published removed after delete + rehydrate',
  )
}

async function testRiskRulePublishAndRuntime(): Promise<void> {
  const doc = builtinRiskRuleToConfig('ignored_warning')
  doc.version = 1
  doc.status = 'draft'
  doc.title = 'API rule'
  doc.description = 'API rule desc'
  doc.scoreDelta = 33

  await api(`/api/risk-rules/${doc.ruleId}/versions/${doc.version}`, {
    method: 'PUT',
    body: JSON.stringify(doc),
  })
  await api(`/api/risk-rules/${doc.ruleId}/versions/${doc.version}/publish`, { method: 'POST' })

  resetCache()
  const snapshot = await api<{ riskRules: Record<string, typeof doc[]> }>('/api/registry')
  hydrateRegistryCache(sanitizeRegistrySnapshot(snapshot))
  const published = listPublishedRiskRuleConfigs().find((d) => d.ruleId === doc.ruleId)
  assert(published?.scoreDelta === 33, 'cache published risk rule')

  const runtime = getRuntimeRiskRules().find((r) => r.id === 'ignored_warning')
  assert(runtime?.delta === 33, 'risk engine uses cache published rule')
}

async function testMigrateMergeNotReplace(): Promise<void> {
  const existing = createDefaultScenarioConfig('existing_on_server', 'banking')
  existing.metadata.title = 'Server'
  existing.metadata.description = 'Server desc'
  existing.metadata.expectedRiskFlags = ['ignored_warning']
  existing.metadata.targetProfileIds = ['normal_user']

  await api('/api/registry/migrate', {
    method: 'POST',
    body: JSON.stringify({ scenarios: { [existing.scenarioId]: [existing] }, riskRules: {} }),
  })

  const localOnly = createDefaultScenarioConfig('local_only_migrate', 'wallet')
  localOnly.metadata.title = 'Local'
  localOnly.metadata.description = 'Local desc'
  localOnly.metadata.expectedRiskFlags = ['recovery_phrase_entered']

  const merged = await api<{ scenarios: Record<string, unknown[]> }>('/api/registry/migrate', {
    method: 'POST',
    body: JSON.stringify({
      scenarios: { [localOnly.scenarioId]: [localOnly] },
      riskRules: {},
    }),
  })

  assert(
    (merged.scenarios.existing_on_server ?? []).length >= 1,
    'migrate merges without dropping existing server family',
  )
  assert(
    (merged.scenarios.local_only_migrate ?? []).length >= 1,
    'migrate adds local family',
  )
}

async function testSanitizeInvalidDocuments(): Promise<void> {
  const cleaned = sanitizeRegistrySnapshot({
    schemaVersion: 1,
    scenarios: {
      bad_family: [{ ruleId: 'not-a-scenario' } as never],
      ok_family: [
        (() => {
          const d = createDefaultScenarioConfig('sanitize_ok', 'banking')
          d.metadata.title = 'T'
          d.metadata.description = 'D'
          d.metadata.expectedRiskFlags = ['ignored_warning']
          return d
        })(),
      ],
    },
    riskRules: {},
  })
  assert(cleaned.scenarios.bad_family === undefined, 'invalid scenario family removed')
  assert((cleaned.scenarios.ok_family ?? []).length === 1, 'valid scenario kept')
}

async function testBuiltinBaselineUnchanged(): Promise<void> {
  resetCache()
  const builtin = mockScenarios[0]
  const runtime = listRuntimeScenarios().find((s) => s.id === builtin.id)
  assert(runtime?.title === builtin.title, 'builtin scenario unchanged')
  assert(
    getRuntimeRiskRules().length >= 10,
    'builtin risk rules present with empty cache',
  )
}

async function main(): Promise<void> {
  try {
    await testHealthAndSnapshot()
    await testScenarioCrudAndDelete()
    await testRiskRulePublishAndRuntime()
    await testMigrateMergeNotReplace()
    await testSanitizeInvalidDocuments()
    await testBuiltinBaselineUnchanged()
    console.log('Phase 3D.1 stabilization: all checks passed.')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('fetch failed') || message.includes('ECONNREFUSED')) {
      console.error('Start registry API first: npm run dev:registry')
    }
    throw error
  }
}

void main()
