import type { AuthoringActor } from './authoringLifecycle'

export const AUDIT_ENTITY_TYPES = ['scenario', 'risk_rule'] as const
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number]

export const AUDIT_ACTION_TYPES = [
  'created',
  'edited',
  'imported',
  'published',
  'deleted',
  'submitted_review',
] as const
export type AuditActionType = (typeof AUDIT_ACTION_TYPES)[number]

export type AuditEvent = {
  id: string
  entityType: AuditEntityType
  entityId: string
  version: number
  action: AuditActionType
  actor: AuthoringActor
  timestamp: string
  note?: string
  changeSummary?: string
}

export type AuditEventListResponse = {
  entityType: AuditEntityType
  entityId: string
  events: AuditEvent[]
}

export type PublishNotePayload = {
  note?: string
}
