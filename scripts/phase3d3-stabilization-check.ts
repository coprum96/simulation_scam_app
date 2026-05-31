/**
 * Phase 3D.3 audit & review checks. Run: npm run dev:registry && npm run check:phase3d3
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
  const session = (await response.json()) as { token: string }
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

async function testAuditLifecycleFlow(): Promise<void> {
  const editorToken = await login('editor', 'editor')
  const publisherToken = await login('publisher', 'publisher')
  const scenarioId = 'audit_phase3d3_test'
  const doc = {
    schemaVersion: 1,
    scenarioId,
    version: 1,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      title: 'Audit test',
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
        nextByAction: {},
      },
    ],
  }

  const put = await api(`/api/scenarios/${scenarioId}/versions/1`, {
    method: 'PUT',
    token: editorToken,
    body: JSON.stringify(doc),
  })
  assert(put.status === 200, 'editor saves draft')
  assert(put.body.lifecycle?.lastModifiedBy?.username === 'editor', 'lifecycle lastModifiedBy')

  const auditAfterEdit = await api<{ events: { action: string }[] }>(
    `/api/scenarios/${scenarioId}/audit`,
    { method: 'GET', token: editorToken },
  )
  assert(auditAfterEdit.body.events.some((e) => e.action === 'created' || e.action === 'edited'), 'audit after save')

  const submit = await api<{ status: string }>(
    `/api/scenarios/${scenarioId}/versions/1/submit-review`,
    {
      method: 'POST',
      token: editorToken,
      body: JSON.stringify({ note: 'Ready for review' }),
    },
  )
  assert(submit.status === 200, 'submit review')
  assert(submit.body.status === 'in_review', 'status in_review')

  const publishDenied = await api(
    `/api/scenarios/${scenarioId}/versions/1/publish`,
    { method: 'POST', token: editorToken, body: JSON.stringify({}) },
  )
  assert(publishDenied.status === 403, 'editor cannot publish')

  const publish = await api<{ status: string; lifecycle?: { publishedBy?: { username: string } } }>(
    `/api/scenarios/${scenarioId}/versions/1/publish`,
    {
      method: 'POST',
      token: publisherToken,
      body: JSON.stringify({ note: 'Ship it' }),
    },
  )
  assert(publish.status === 200, 'publisher publishes')
  assert(publish.body.status === 'published', 'status published')
  assert(publish.body.lifecycle?.publishedBy?.username === 'publisher', 'publishedBy set')

  const auditFinal = await api<{ events: { action: string }[] }>(
    `/api/scenarios/${scenarioId}/audit?version=1`,
    { method: 'GET', token: publisherToken },
  )
  assert(auditFinal.body.events.some((e) => e.action === 'published'), 'published audit event')
  assert(auditFinal.body.events.some((e) => e.action === 'submitted_review'), 'review audit event')

  const del = await api(`/api/scenarios/${scenarioId}/versions/1`, {
    method: 'DELETE',
    token: publisherToken,
  })
  assert(del.status === 200, 'delete version')
}

async function main(): Promise<void> {
  const health = await fetch(`${REGISTRY_BASE}/api/health`)
  assert(health.ok, 'registry server running on ' + REGISTRY_BASE)
  await testAuditLifecycleFlow()
  console.log('Phase 3D.3 stabilization checks passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
