import { useCallback, useSyncExternalStore } from 'react'
import type { InvestigationMarker } from './types'
import {
  getWorkflowStorageSnapshot,
  refreshWorkflowStorageSnapshot,
  setInvestigationMarker,
  setSessionNote,
} from './workflowStorage'

function subscribe(callback: () => void): () => void {
  const handler = () => callback()
  window.addEventListener('storage', handler)
  window.addEventListener('research-workflow-change', handler)
  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener('research-workflow-change', handler)
  }
}

export function notifyWorkflowChange(): void {
  refreshWorkflowStorageSnapshot()
  window.dispatchEvent(new Event('research-workflow-change'))
}

function getSnapshot(): ReturnType<typeof getWorkflowStorageSnapshot> {
  return getWorkflowStorageSnapshot()
}

export function useInvestigationMarkers(sessionId?: string) {
  const storage = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const marker: InvestigationMarker = sessionId
    ? (storage.markers[sessionId] ?? 'pending')
    : 'pending'
  const note = sessionId ? (storage.notes[sessionId] ?? '') : ''

  const setMarker = useCallback(
    (next: InvestigationMarker) => {
      if (!sessionId) return
      setInvestigationMarker(sessionId, next)
      notifyWorkflowChange()
    },
    [sessionId],
  )

  const saveNote = useCallback(
    (next: string) => {
      if (!sessionId) return
      setSessionNote(sessionId, next)
      notifyWorkflowChange()
    },
    [sessionId],
  )

  return { marker, note, setMarker, saveNote }
}

export function useWorkflowStorageSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
