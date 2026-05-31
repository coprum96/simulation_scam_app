import crypto from 'node:crypto'

export const AUDIT_ACTIONS = [
  'created',
  'edited',
  'imported',
  'published',
  'deleted',
  'submitted_review',
]

/**
 * @typedef {'scenario' | 'risk_rule'} AuditEntityType
 * @typedef {typeof AUDIT_ACTIONS[number]} AuditActionType
 * @typedef {{ id: string, username: string, displayName: string }} AuditActor
 * @typedef {{
 *   id: string
 *   entityType: AuditEntityType
 *   entityId: string
 *   version: number
 *   action: AuditActionType
 *   actor: AuditActor
 *   timestamp: string
 *   note?: string
 *   changeSummary?: string
 * }} AuditEvent
 */

export function toAuditActor(user) {
  if (!user) return { id: 'system', username: 'system', displayName: 'Система' }
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
  }
}

export function appendAuditEvent(store, event) {
  if (!Array.isArray(store.auditLog)) store.auditLog = []
  const entry = {
    id: event.id ?? `audit_${crypto.randomBytes(8).toString('hex')}`,
    entityType: event.entityType,
    entityId: event.entityId,
    version: event.version,
    action: event.action,
    actor: event.actor,
    timestamp: event.timestamp ?? new Date().toISOString(),
    ...(event.note ? { note: String(event.note).slice(0, 2000) } : {}),
    ...(event.changeSummary ? { changeSummary: String(event.changeSummary).slice(0, 500) } : {}),
  }
  store.auditLog.unshift(entry)
  if (store.auditLog.length > 5000) store.auditLog.length = 5000
  return entry
}

export function listAuditEvents(store, { entityType, entityId, version }) {
  const log = store.auditLog ?? []
  return log.filter((e) => {
    if (entityType && e.entityType !== entityType) return false
    if (entityId && e.entityId !== entityId) return false
    if (version != null && e.version !== version) return false
    return true
  })
}

export function summarizeScenarioChange(before, after) {
  if (!before) return 'Новая конфигурация сценария'
  const parts = []
  if (before.metadata?.title !== after.metadata?.title) {
    parts.push(`название: «${before.metadata?.title}» → «${after.metadata?.title}»`)
  }
  if (before.metadata?.riskLevel !== after.metadata?.riskLevel) {
    parts.push(`риск: ${before.metadata?.riskLevel} → ${after.metadata?.riskLevel}`)
  }
  if ((before.steps?.length ?? 0) !== (after.steps?.length ?? 0)) {
    parts.push(`шаги: ${before.steps?.length ?? 0} → ${after.steps?.length ?? 0}`)
  }
  return parts.length > 0 ? parts.join('; ') : 'Изменения метаданных и шагов'
}

export function summarizeRiskRuleChange(before, after) {
  if (!before) return 'Новая конфигурация правила'
  const parts = []
  if (before.title !== after.title) parts.push(`название: «${before.title}» → «${after.title}»`)
  if (before.scoreDelta !== after.scoreDelta) {
    parts.push(`scoreDelta: ${before.scoreDelta} → ${after.scoreDelta}`)
  }
  if (before.enabled !== after.enabled) {
    parts.push(`enabled: ${before.enabled} → ${after.enabled}`)
  }
  return parts.length > 0 ? parts.join('; ') : 'Изменения параметров правила'
}

export function touchLifecycle(doc, actor, { published = false, publishNote } = {}) {
  const now = new Date().toISOString()
  const lifecycle = { ...(doc.lifecycle ?? {}) }
  lifecycle.lastModifiedBy = actor
  lifecycle.lastModifiedAt = now
  if (published) {
    lifecycle.publishedBy = actor
    lifecycle.publishedAt = now
    if (publishNote) lifecycle.lastPublishNote = String(publishNote).slice(0, 2000)
  }
  return { ...doc, lifecycle, updatedAt: now }
}
