/**
 * Phase 3D.2 governance checks. Run: npm run dev:registry && npx tsx scripts/phase3d2-stabilization-check.ts
 */
const REGISTRY_BASE = process.env.REGISTRY_TEST_URL ?? 'http://localhost:3001'

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

async function login(username: string, password: string): Promise<string> {
  const response = await fetch(`${REGISTRY_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  assert(response.ok, `login ${username}`)
  const session = (await response.json()) as { token: string; user: { role: string } }
  assert(typeof session.token === 'string', 'token present')
  return session.token
}

async function api<T>(
  pathname: string,
  init: RequestInit & { token?: string },
): Promise<{ status: number; body: T }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }
  if (init.token) headers.Authorization = `Bearer ${init.token}`
  const { token: _t, ...rest } = init
  const response = await fetch(`${REGISTRY_BASE}${pathname}`, { ...rest, headers })
  const body = (await response.json()) as T
  return { status: response.status, body }
}

async function testUnauthenticatedDenied(): Promise<void> {
  const res = await api('/api/registry', { method: 'GET' })
  assert(res.status === 401, 'GET /api/registry without token → 401')
}

async function testViewerReadOnly(): Promise<void> {
  const token = await login('viewer', 'viewer')
  const read = await api('/api/registry', { method: 'GET', token })
  assert(read.status === 200, 'viewer can read registry')

  const put = await api('/api/scenarios/test_scenario/versions/1', {
    method: 'PUT',
    token,
    body: JSON.stringify({
      scenarioId: 'test_scenario',
      version: 1,
      status: 'draft',
      metadata: {},
      steps: [],
    }),
  })
  assert(put.status === 403, 'viewer cannot PUT draft')
}

async function testEditorDraftPublisherPublish(): Promise<void> {
  const editorToken = await login('editor', 'editor')
  const doc = {
    schemaVersion: 1,
    scenarioId: 'gov_phase3d2_test',
    version: 1,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      title: 'Gov test',
      description: 'Desc',
      simulatorType: 'banking',
      riskLevel: 'medium',
      warningsEnabled: true,
      expectedRiskFlags: [],
      warningKeys: [],
      targetProfileIds: ['normal_user'],
    },
    steps: [
      {
        stepId: 'intro',
        screenId: 'banking_intro',
        title: 'Intro',
        bodyRef: 'intro',
        actions: [{ actionId: 'next', labelRef: 'next', kind: 'primary' }],
      },
    ],
  }

  const put = await api(`/api/scenarios/${doc.scenarioId}/versions/${doc.version}`, {
    method: 'PUT',
    token: editorToken,
    body: JSON.stringify(doc),
  })
  assert(put.status === 200, 'editor can save draft')

  const publishDenied = await api(
    `/api/scenarios/${doc.scenarioId}/versions/${doc.version}/publish`,
    { method: 'POST', token: editorToken },
  )
  assert(publishDenied.status === 403, 'editor cannot publish')

  const publisherToken = await login('publisher', 'publisher')
  const publishOk = await api(
    `/api/scenarios/${doc.scenarioId}/versions/${doc.version}/publish`,
    { method: 'POST', token: publisherToken },
  )
  assert(publishOk.status === 200, 'publisher can publish')

  const del = await api(`/api/scenarios/${doc.scenarioId}/versions/${doc.version}`, {
    method: 'DELETE',
    token: publisherToken,
  })
  assert(del.status === 200, 'publisher can delete version')
}

async function main(): Promise<void> {
  const health = await fetch(`${REGISTRY_BASE}/api/health`)
  assert(health.ok, 'registry server running on ' + REGISTRY_BASE)

  await testUnauthenticatedDenied()
  await testViewerReadOnly()
  await testEditorDraftPublisherPublish()
  console.log('Phase 3D.2 stabilization checks passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
