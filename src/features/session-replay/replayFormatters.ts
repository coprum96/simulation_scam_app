import { ru } from '../../content/ru'
import type { SessionOutcome, SessionStatus } from '../../types/contracts'
import type { TelemetryEventType } from '../../types/telemetry'

export function formatReplayTimestamp(ms: number): string {
  return new Date(ms).toLocaleString('ru-RU')
}

export function formatReplayDuration(ms: number): string {
  if (ms < 1000) return `${ms} мс`
  const sec = Math.round(ms / 1000)
  if (sec < 60) return `${sec} с`
  const min = Math.floor(sec / 60)
  const rem = sec % 60
  return rem > 0 ? `${min} мин ${rem} с` : `${min} мин`
}

export function formatReplayDelay(ms: number | null): string {
  if (ms === null) return ru.replay.confirmationDelayNone
  return formatReplayDuration(ms)
}

export function replayStatusLabel(status: SessionStatus): string {
  return status === 'active' ? ru.replay.statusActive : ru.replay.statusEnded
}

export function replayOutcomeLabel(outcome: SessionOutcome | null): string {
  if (!outcome) return ru.replay.outcomeNone
  const map = {
    completed: ru.replay.outcomeCompleted,
    stopped: ru.replay.outcomeStopped,
    abandoned: ru.replay.outcomeAbandoned,
  } as const
  return map[outcome]
}

export function replayEventTypeLabel(type: TelemetryEventType): string {
  return ru.replay.eventTypes[type] ?? type
}

export function formatEventMeta(meta?: Record<string, unknown>): string {
  if (!meta || Object.keys(meta).length === 0) return '—'
  try {
    return JSON.stringify(meta)
  } catch {
    return '—'
  }
}
