import { ru } from '../../content/ru'
import type { AuditActionType } from '../../types/audit'
import type { AuthoringReviewState } from '../../types/authoringLifecycle'

export function formatAuditAction(action: AuditActionType): string {
  return ru.audit.actions[action]
}

export function formatReviewState(state: AuthoringReviewState): string {
  return ru.authoring.statusLabels[state]
}

export function formatAuditTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function formatActorName(displayName: string): string {
  return displayName.trim() || '—'
}
