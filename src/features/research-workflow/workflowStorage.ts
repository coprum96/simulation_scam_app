import type { InvestigationMarker, WorkflowStorageV1 } from './types'
import { WORKFLOW_STORAGE_SCHEMA_VERSION } from './types'

const STORAGE_KEY = 'scam_app_ru.research_workflow.v1'

const EMPTY: WorkflowStorageV1 = {
  schemaVersion: WORKFLOW_STORAGE_SCHEMA_VERSION,
  markers: {},
  notes: {},
  visited: {
    analytics: false,
    explainSessionIds: [],
    replaySessionIds: [],
    compare: false,
    export: false,
  },
  workflowIntroDismissed: false,
}

/** Stable snapshot for useSyncExternalStore — referential equality until data changes. */
let cachedSnapshot: WorkflowStorageV1 = EMPTY
let cachedSnapshotJson = JSON.stringify(EMPTY)

function hasWindowStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function syncCachedSnapshot(state: WorkflowStorageV1): WorkflowStorageV1 {
  const json = JSON.stringify(state)
  if (json === cachedSnapshotJson) return cachedSnapshot
  cachedSnapshot = state
  cachedSnapshotJson = json
  return cachedSnapshot
}

export function getWorkflowStorageSnapshot(): WorkflowStorageV1 {
  return cachedSnapshot
}

function readRaw(): WorkflowStorageV1 {
  if (!hasWindowStorage()) return structuredClone(EMPTY)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(EMPTY)
    const parsed = JSON.parse(raw) as Partial<WorkflowStorageV1>
    if (parsed.schemaVersion !== WORKFLOW_STORAGE_SCHEMA_VERSION) return structuredClone(EMPTY)
    return {
      schemaVersion: WORKFLOW_STORAGE_SCHEMA_VERSION,
      markers: parsed.markers && typeof parsed.markers === 'object' ? parsed.markers : {},
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      visited: {
        analytics: Boolean(parsed.visited?.analytics),
        explainSessionIds: Array.isArray(parsed.visited?.explainSessionIds)
          ? parsed.visited.explainSessionIds.filter((id): id is string => typeof id === 'string')
          : [],
        replaySessionIds: Array.isArray(parsed.visited?.replaySessionIds)
          ? parsed.visited.replaySessionIds.filter((id): id is string => typeof id === 'string')
          : [],
        compare: Boolean(parsed.visited?.compare),
        export: Boolean(parsed.visited?.export),
      },
      workflowIntroDismissed: Boolean(parsed.workflowIntroDismissed),
    }
  } catch {
    return structuredClone(EMPTY)
  }
}

export function refreshWorkflowStorageSnapshot(): void {
  syncCachedSnapshot(readRaw())
}

function writeRaw(state: WorkflowStorageV1): void {
  if (!hasWindowStorage()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota errors
  }
}

function commitWorkflowStorage(state: WorkflowStorageV1): void {
  const prevJson = cachedSnapshotJson
  writeRaw(state)
  syncCachedSnapshot(state)
  if (cachedSnapshotJson !== prevJson && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('research-workflow-change'))
  }
}

function uniquePush(list: string[], value: string): string[] {
  if (list.includes(value)) return list
  return [...list, value]
}

export function loadWorkflowStorage(): WorkflowStorageV1 {
  return readRaw()
}

export function dismissWorkflowIntro(): void {
  const state = readRaw()
  commitWorkflowStorage({ ...state, workflowIntroDismissed: true })
}

export function isWorkflowIntroDismissed(): boolean {
  return readRaw().workflowIntroDismissed
}

export function getInvestigationMarker(sessionId: string): InvestigationMarker {
  return readRaw().markers[sessionId] ?? 'pending'
}

export function setInvestigationMarker(sessionId: string, marker: InvestigationMarker): void {
  const state = readRaw()
  commitWorkflowStorage({
    ...state,
    markers: { ...state.markers, [sessionId]: marker },
  })
}

export function getSessionNote(sessionId: string): string {
  return readRaw().notes[sessionId] ?? ''
}

export function setSessionNote(sessionId: string, note: string): void {
  const state = readRaw()
  const trimmed = note.trim().slice(0, 280)
  const notes = { ...state.notes }
  if (!trimmed) delete notes[sessionId]
  else notes[sessionId] = trimmed
  commitWorkflowStorage({ ...state, notes })
}

export function markAnalyticsVisited(): void {
  const state = readRaw()
  if (state.visited.analytics) return
  commitWorkflowStorage({
    ...state,
    visited: { ...state.visited, analytics: true },
  })
}

export function markExplainVisited(sessionId: string): void {
  const state = readRaw()
  const explainSessionIds = uniquePush(state.visited.explainSessionIds, sessionId)
  if (explainSessionIds === state.visited.explainSessionIds) return
  commitWorkflowStorage({
    ...state,
    visited: { ...state.visited, explainSessionIds },
  })
}

export function markReplayVisited(sessionId: string): void {
  const state = readRaw()
  const replaySessionIds = uniquePush(state.visited.replaySessionIds, sessionId)
  if (replaySessionIds === state.visited.replaySessionIds) return
  commitWorkflowStorage({
    ...state,
    visited: { ...state.visited, replaySessionIds },
  })
}

export function markCompareVisited(): void {
  const state = readRaw()
  if (state.visited.compare) return
  commitWorkflowStorage({
    ...state,
    visited: { ...state.visited, compare: true },
  })
}

export function markExportVisited(): void {
  const state = readRaw()
  if (state.visited.export) return
  commitWorkflowStorage({
    ...state,
    visited: { ...state.visited, export: true },
  })
}

/** Test-only reset */
export function resetWorkflowStorage(): void {
  if (!hasWindowStorage()) return
  localStorage.removeItem(STORAGE_KEY)
  syncCachedSnapshot(structuredClone(EMPTY))
}

if (hasWindowStorage()) {
  refreshWorkflowStorageSnapshot()
}
