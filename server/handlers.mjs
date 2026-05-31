import { authenticateRequest, handleAuthRoutes } from './auth.mjs'
import { handleSessionArchiveRoutes } from './sessionArchiveHandlers.mjs'
import { readSessionArchiveStore } from './sessionArchiveStore.mjs'
import {
  appendAuditEvent,
  listAuditEvents,
  summarizeRiskRuleChange,
  summarizeScenarioChange,
  toAuditActor,
  touchLifecycle,
} from './audit.mjs'
import { hasPermission, permissionForRequest } from './permissions.mjs'
import {
  latestPublished,
  listVersions,
  readRegistryStore,
  removeVersion,
  upsertVersion,
  writeRegistryStore,
} from './registryStore.mjs'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...CORS_HEADERS,
  })
  res.end(JSON.stringify(body))
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return null
  const text = Buffer.concat(chunks).toString('utf8')
  if (!text.trim()) return null
  return JSON.parse(text)
}

function countDocuments(map) {
  return Object.values(map).reduce((sum, versions) => sum + versions.length, 0)
}

function actorFromAuth(auth) {
  return toAuditActor(auth?.user)
}

function mergeMigration(store, payload, auth) {
  const scenarios = payload?.scenarios ?? {}
  const riskRules = payload?.riskRules ?? {}
  const actor = actorFromAuth(auth)
  for (const [id, versions] of Object.entries(scenarios)) {
    if (!Array.isArray(versions)) continue
    for (const doc of versions) {
      if (doc && typeof doc.scenarioId === 'string') {
        upsertVersion(store.scenarios, id, touchLifecycle(doc, actor))
        appendAuditEvent(store, {
          entityType: 'scenario',
          entityId: doc.scenarioId,
          version: doc.version,
          action: 'imported',
          actor,
          changeSummary: summarizeScenarioChange(null, doc),
        })
      }
    }
  }
  for (const [id, versions] of Object.entries(riskRules)) {
    if (!Array.isArray(versions)) continue
    for (const doc of versions) {
      if (doc && typeof doc.ruleId === 'string') {
        upsertVersion(store.riskRules, id, touchLifecycle(doc, actor))
        appendAuditEvent(store, {
          entityType: 'risk_rule',
          entityId: doc.ruleId,
          version: doc.version,
          action: 'imported',
          actor,
          changeSummary: summarizeRiskRuleChange(null, doc),
        })
      }
    }
  }
  store.migratedFromLocalAt = new Date().toISOString()
}

function handleAuditList(req, res, url, entityType) {
  const entityId = decodeURIComponent(url.pathname.split('/')[3])
  const versionParam = url.searchParams.get('version')
  const version = versionParam != null ? Number(versionParam) : undefined
  return readRegistryStore().then((store) => {
    const events = listAuditEvents(store, {
      entityType,
      entityId,
      version: Number.isFinite(version) ? version : undefined,
    })
    return json(res, 200, { entityType, entityId, events })
  })
}

export async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS)
    res.end()
    return
  }

  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
  const { pathname } = url

  try {
    if (await handleAuthRoutes(req, res, url)) return

    if (await handleSessionArchiveRoutes(req, res, url, json)) return

    if (req.method === 'GET' && pathname === '/api/health') {
      const archiveStore = await readSessionArchiveStore().catch(() => ({ sessions: {} }))
      return json(res, 200, {
        ok: true,
        service: 'authoring-registry',
        sessionArchiveCount: Object.keys(archiveStore.sessions ?? {}).length,
      })
    }

    const requiredPermission = permissionForRequest(req.method, pathname)
    let auth = null
    if (requiredPermission) {
      auth = await authenticateRequest(req)
      if (!auth) return json(res, 401, { error: 'unauthorized' })
      if (!hasPermission(auth.user.role, requiredPermission)) {
        return json(res, 403, { error: 'forbidden' })
      }
    }

    if (req.method === 'GET' && pathname === '/api/registry') {
      const store = await readRegistryStore()
      return json(res, 200, store)
    }

    if (req.method === 'GET' && pathname === '/api/registry/status') {
      const store = await readRegistryStore()
      return json(res, 200, {
        schemaVersion: 1,
        scenarioFamilies: Object.keys(store.scenarios).length,
        riskRuleFamilies: Object.keys(store.riskRules).length,
        scenarioDocuments: countDocuments(store.scenarios),
        riskRuleDocuments: countDocuments(store.riskRules),
        auditEvents: (store.auditLog ?? []).length,
        migratedFromLocalAt: store.migratedFromLocalAt,
      })
    }

    if (req.method === 'GET' && pathname.match(/^\/api\/scenarios\/[^/]+\/audit$/)) {
      return handleAuditList(req, res, url, 'scenario')
    }

    if (req.method === 'GET' && pathname.match(/^\/api\/risk-rules\/[^/]+\/audit$/)) {
      return handleAuditList(req, res, url, 'risk_rule')
    }

    if (req.method === 'POST' && pathname === '/api/registry/migrate') {
      const body = await readBody(req)
      const store = await readRegistryStore()
      mergeMigration(store, body, auth)
      const saved = await writeRegistryStore(store)
      return json(res, 200, saved)
    }

    if (req.method === 'GET' && pathname === '/api/scenarios/published') {
      const store = await readRegistryStore()
      const documents = []
      for (const id of Object.keys(store.scenarios)) {
        const pub = latestPublished(listVersions(store.scenarios, id))
        if (pub) documents.push(pub)
      }
      return json(res, 200, { documents })
    }

    if (req.method === 'GET' && pathname === '/api/risk-rules/published') {
      const store = await readRegistryStore()
      const documents = []
      for (const id of Object.keys(store.riskRules)) {
        const pub = latestPublished(listVersions(store.riskRules, id))
        if (pub) documents.push(pub)
      }
      return json(res, 200, { documents })
    }

    const scenarioVersionsMatch = pathname.match(/^\/api\/scenarios\/([^/]+)\/versions$/)
    if (req.method === 'GET' && scenarioVersionsMatch) {
      const scenarioId = decodeURIComponent(scenarioVersionsMatch[1])
      const store = await readRegistryStore()
      return json(res, 200, {
        scenarioId,
        versions: listVersions(store.scenarios, scenarioId),
      })
    }

    const scenarioDocMatch = pathname.match(/^\/api\/scenarios\/([^/]+)\/versions\/(\d+)$/)
    if (scenarioDocMatch) {
      const scenarioId = decodeURIComponent(scenarioDocMatch[1])
      const version = Number(scenarioDocMatch[2])
      const store = await readRegistryStore()
      const actor = actorFromAuth(auth)

      if (req.method === 'GET') {
        const doc = listVersions(store.scenarios, scenarioId).find((v) => v.version === version)
        if (!doc) return json(res, 404, { error: 'not_found' })
        return json(res, 200, doc)
      }

      if (req.method === 'PUT') {
        const body = await readBody(req)
        if (!body || body.scenarioId !== scenarioId || body.version !== version) {
          return json(res, 400, { error: 'invalid_document' })
        }
        const previousId = url.searchParams.get('previousScenarioId')
        if (previousId && previousId !== scenarioId) {
          removeVersion(store.scenarios, previousId, version)
        }
        const before = listVersions(store.scenarios, scenarioId).find((v) => v.version === version)
        const savedDoc = touchLifecycle(
          { ...body, status: 'draft' },
          actor,
        )
        upsertVersion(store.scenarios, scenarioId, savedDoc)
        appendAuditEvent(store, {
          entityType: 'scenario',
          entityId: scenarioId,
          version,
          action: before ? 'edited' : 'created',
          actor,
          changeSummary: summarizeScenarioChange(before, savedDoc),
        })
        await writeRegistryStore(store)
        return json(res, 200, savedDoc)
      }

      if (req.method === 'DELETE') {
        const existing = listVersions(store.scenarios, scenarioId).find((v) => v.version === version)
        if (!existing) return json(res, 404, { error: 'not_found' })
        appendAuditEvent(store, {
          entityType: 'scenario',
          entityId: scenarioId,
          version,
          action: 'deleted',
          actor,
        })
        removeVersion(store.scenarios, scenarioId, version)
        await writeRegistryStore(store)
        return json(res, 200, { ok: true })
      }
    }

    const scenarioSubmitMatch = pathname.match(
      /^\/api\/scenarios\/([^/]+)\/versions\/(\d+)\/submit-review$/,
    )
    if (req.method === 'POST' && scenarioSubmitMatch) {
      const scenarioId = decodeURIComponent(scenarioSubmitMatch[1])
      const version = Number(scenarioSubmitMatch[2])
      const body = (await readBody(req)) ?? {}
      const store = await readRegistryStore()
      const target = listVersions(store.scenarios, scenarioId).find((v) => v.version === version)
      if (!target) return json(res, 404, { error: 'not_found' })
      if (target.status !== 'draft') return json(res, 400, { error: 'invalid_review_transition' })
      const actor = actorFromAuth(auth)
      const updated = touchLifecycle({ ...target, status: 'in_review' }, actor)
      upsertVersion(store.scenarios, scenarioId, updated)
      appendAuditEvent(store, {
        entityType: 'scenario',
        entityId: scenarioId,
        version,
        action: 'submitted_review',
        actor,
        note: body.note,
      })
      await writeRegistryStore(store)
      return json(res, 200, updated)
    }

    const scenarioPublishMatch = pathname.match(
      /^\/api\/scenarios\/([^/]+)\/versions\/(\d+)\/publish$/,
    )
    if (req.method === 'POST' && scenarioPublishMatch) {
      const scenarioId = decodeURIComponent(scenarioPublishMatch[1])
      const version = Number(scenarioPublishMatch[2])
      const body = (await readBody(req)) ?? {}
      const store = await readRegistryStore()
      const versions = listVersions(store.scenarios, scenarioId)
      const target = versions.find((v) => v.version === version)
      if (!target) return json(res, 404, { error: 'not_found' })
      const actor = actorFromAuth(auth)
      const updated = versions.map((v) => {
        if (v.version === version) {
          return touchLifecycle({ ...v, status: 'published' }, actor, {
            published: true,
            publishNote: body.note,
          })
        }
        if (v.status === 'published') {
          return touchLifecycle({ ...v, status: 'draft' }, actor)
        }
        return v
      })
      store.scenarios[scenarioId] = updated
      appendAuditEvent(store, {
        entityType: 'scenario',
        entityId: scenarioId,
        version,
        action: 'published',
        actor,
        note: body.note,
        changeSummary: summarizeScenarioChange(null, target),
      })
      await writeRegistryStore(store)
      return json(res, 200, updated.find((v) => v.version === version))
    }

    const scenarioNewVersionMatch = pathname.match(/^\/api\/scenarios\/([^/]+)\/versions$/)
    if (req.method === 'POST' && scenarioNewVersionMatch) {
      const scenarioId = decodeURIComponent(scenarioNewVersionMatch[1])
      const base = await readBody(req)
      if (!base || base.scenarioId !== scenarioId) return json(res, 400, { error: 'invalid_document' })
      const store = await readRegistryStore()
      const versions = listVersions(store.scenarios, scenarioId)
      const maxVersion = versions.reduce((m, v) => Math.max(m, v.version), 0)
      const now = new Date().toISOString()
      const actor = actorFromAuth(auth)
      const draft = touchLifecycle(
        {
          ...structuredClone(base),
          version: maxVersion + 1,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
        },
        actor,
      )
      upsertVersion(store.scenarios, scenarioId, draft)
      appendAuditEvent(store, {
        entityType: 'scenario',
        entityId: scenarioId,
        version: draft.version,
        action: 'created',
        actor,
        changeSummary: summarizeScenarioChange(null, draft),
      })
      await writeRegistryStore(store)
      return json(res, 201, draft)
    }

    const riskVersionsMatch = pathname.match(/^\/api\/risk-rules\/([^/]+)\/versions$/)
    if (req.method === 'GET' && riskVersionsMatch) {
      const ruleId = decodeURIComponent(riskVersionsMatch[1])
      const store = await readRegistryStore()
      return json(res, 200, { ruleId, versions: listVersions(store.riskRules, ruleId) })
    }

    const riskDocMatch = pathname.match(/^\/api\/risk-rules\/([^/]+)\/versions\/(\d+)$/)
    if (riskDocMatch) {
      const ruleId = decodeURIComponent(riskDocMatch[1])
      const version = Number(riskDocMatch[2])
      const store = await readRegistryStore()
      const actor = actorFromAuth(auth)

      if (req.method === 'GET') {
        const doc = listVersions(store.riskRules, ruleId).find((v) => v.version === version)
        if (!doc) return json(res, 404, { error: 'not_found' })
        return json(res, 200, doc)
      }

      if (req.method === 'PUT') {
        const body = await readBody(req)
        if (!body || body.ruleId !== ruleId || body.version !== version) {
          return json(res, 400, { error: 'invalid_document' })
        }
        const previousId = url.searchParams.get('previousRuleId')
        if (previousId && previousId !== ruleId) {
          delete store.riskRules[previousId]
        }
        const before = listVersions(store.riskRules, ruleId).find((v) => v.version === version)
        const allowPublished =
          auth?.user?.role === 'publisher' && body.status === 'published'
        const savedDoc = touchLifecycle(
          { ...body, status: allowPublished ? 'published' : 'draft' },
          actor,
          allowPublished ? { published: true } : {},
        )
        upsertVersion(store.riskRules, ruleId, savedDoc)
        appendAuditEvent(store, {
          entityType: 'risk_rule',
          entityId: ruleId,
          version,
          action: before ? (allowPublished ? 'published' : 'edited') : 'created',
          actor,
          changeSummary: summarizeRiskRuleChange(before, savedDoc),
        })
        await writeRegistryStore(store)
        return json(res, 200, savedDoc)
      }

      if (req.method === 'DELETE') {
        const existing = listVersions(store.riskRules, ruleId).find((v) => v.version === version)
        if (!existing) return json(res, 404, { error: 'not_found' })
        appendAuditEvent(store, {
          entityType: 'risk_rule',
          entityId: ruleId,
          version,
          action: 'deleted',
          actor,
        })
        removeVersion(store.riskRules, ruleId, version)
        await writeRegistryStore(store)
        return json(res, 200, { ok: true })
      }
    }

    const riskSubmitMatch = pathname.match(/^\/api\/risk-rules\/([^/]+)\/versions\/(\d+)\/submit-review$/)
    if (req.method === 'POST' && riskSubmitMatch) {
      const ruleId = decodeURIComponent(riskSubmitMatch[1])
      const version = Number(riskSubmitMatch[2])
      const body = (await readBody(req)) ?? {}
      const store = await readRegistryStore()
      const target = listVersions(store.riskRules, ruleId).find((v) => v.version === version)
      if (!target) return json(res, 404, { error: 'not_found' })
      if (target.status !== 'draft') return json(res, 400, { error: 'invalid_review_transition' })
      const actor = actorFromAuth(auth)
      const updated = touchLifecycle({ ...target, status: 'in_review' }, actor)
      upsertVersion(store.riskRules, ruleId, updated)
      appendAuditEvent(store, {
        entityType: 'risk_rule',
        entityId: ruleId,
        version,
        action: 'submitted_review',
        actor,
        note: body.note,
      })
      await writeRegistryStore(store)
      return json(res, 200, updated)
    }

    const riskPublishMatch = pathname.match(/^\/api\/risk-rules\/([^/]+)\/versions\/(\d+)\/publish$/)
    if (req.method === 'POST' && riskPublishMatch) {
      const ruleId = decodeURIComponent(riskPublishMatch[1])
      const version = Number(riskPublishMatch[2])
      const body = (await readBody(req)) ?? {}
      const store = await readRegistryStore()
      const versions = listVersions(store.riskRules, ruleId)
      const target = versions.find((v) => v.version === version)
      if (!target) return json(res, 404, { error: 'not_found' })
      const actor = actorFromAuth(auth)
      for (const v of versions) {
        if (v.status === 'published' && v.version !== version) {
          upsertVersion(store.riskRules, ruleId, touchLifecycle({ ...v, status: 'draft' }, actor))
        }
      }
      const published = touchLifecycle({ ...target, status: 'published' }, actor, {
        published: true,
        publishNote: body.note,
      })
      upsertVersion(store.riskRules, ruleId, published)
      appendAuditEvent(store, {
        entityType: 'risk_rule',
        entityId: ruleId,
        version,
        action: 'published',
        actor,
        note: body.note,
        changeSummary: summarizeRiskRuleChange(null, target),
      })
      await writeRegistryStore(store)
      return json(res, 200, published)
    }

    const riskNewVersionMatch = pathname.match(/^\/api\/risk-rules\/([^/]+)\/versions$/)
    if (req.method === 'POST' && riskNewVersionMatch) {
      const ruleId = decodeURIComponent(riskNewVersionMatch[1])
      const base = await readBody(req)
      if (!base || base.ruleId !== ruleId) return json(res, 400, { error: 'invalid_document' })
      const store = await readRegistryStore()
      const versions = listVersions(store.riskRules, ruleId)
      const maxVersion = versions.reduce((m, v) => Math.max(m, v.version), 0)
      const now = new Date().toISOString()
      const actor = actorFromAuth(auth)
      const draft = touchLifecycle(
        {
          ...structuredClone(base),
          version: maxVersion + 1,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
        },
        actor,
      )
      upsertVersion(store.riskRules, ruleId, draft)
      appendAuditEvent(store, {
        entityType: 'risk_rule',
        entityId: ruleId,
        version: draft.version,
        action: 'created',
        actor,
        changeSummary: summarizeRiskRuleChange(null, draft),
      })
      await writeRegistryStore(store)
      return json(res, 201, draft)
    }

    return json(res, 404, { error: 'not_found' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'internal_error'
    return json(res, 500, { error: message })
  }
}
