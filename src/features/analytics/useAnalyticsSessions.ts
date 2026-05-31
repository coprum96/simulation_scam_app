import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import type { Session } from '../../types/contracts'
import { useSessionStore } from '../telemetry/sessionStore'
import {
  buildEndedLocalSessionKey,
  fetchArchiveStatus,
  getCachedAnalyticsArchive,
  loadAnalyticsArchive,
  mergeAnalyticsSessionSources,
  selectLocalEndedSessions,
} from '../session-archive'
import {
  filterAnalyticsSessions,
  listAllEndedSessions,
  type AnalyticsFilterState,
} from './analyticsFilters'
import { computeSessionAnalytics } from './computeSessionAnalytics'
import {
  buildAnalyticsSearchParamsWithWorkflowPreset,
  parseAnalyticsSearchParams,
  parseWorkflowPresetParam,
} from './analyticsSearchParams'
import { getWorkflowPreset, isWorkflowPresetId } from '../research-workflow'

type ArchiveLoadPhase = 'idle' | 'loading' | 'ready' | 'error'

export function useAnalyticsSessions() {
  const localEndedSessions = useSessionStore(
    useShallow((s) => selectLocalEndedSessions(s.sessions)),
  )
  const endedLocalSessionKey = useMemo(
    () => buildEndedLocalSessionKey(localEndedSessions),
    [localEndedSessions],
  )

  const [searchParams, setSearchParams] = useSearchParams()
  const [archivedMap, setArchivedMap] = useState<Record<string, Session>>(() => {
    return getCachedAnalyticsArchive(endedLocalSessionKey)?.archivedMap ?? {}
  })
  const [loadPhase, setLoadPhase] = useState<ArchiveLoadPhase>(() => {
    const cached = getCachedAnalyticsArchive(endedLocalSessionKey)
    if (!cached?.ready) return 'idle'
    return cached.error ? 'error' : 'ready'
  })
  const [archiveReachable, setArchiveReachable] = useState<boolean | null>(null)
  const loadKeyRef = useRef(endedLocalSessionKey)

  const filters = useMemo(() => parseAnalyticsSearchParams(searchParams), [searchParams])
  const workflowPresetId = useMemo(() => {
    const raw = parseWorkflowPresetParam(searchParams)
    return raw && isWorkflowPresetId(raw) ? raw : null
  }, [searchParams])

  const setFilters = useCallback(
    (next: AnalyticsFilterState, workflowPreset?: string | null) => {
      setSearchParams(
        buildAnalyticsSearchParamsWithWorkflowPreset(
          next,
          searchParams,
          workflowPreset === undefined ? workflowPresetId : workflowPreset,
        ),
        { replace: true },
      )
    },
    [setSearchParams, searchParams, workflowPresetId],
  )

  useEffect(() => {
    let cancelled = false
    void fetchArchiveStatus().then((status) => {
      if (!cancelled) setArchiveReachable(status != null)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    loadKeyRef.current = endedLocalSessionKey

    const cached = getCachedAnalyticsArchive(endedLocalSessionKey)
    if (cached?.ready) {
      setArchivedMap(cached.archivedMap)
      setLoadPhase(cached.error ? 'error' : 'ready')
      return
    }

    let cancelled = false
    setLoadPhase((prev) => (prev === 'ready' || prev === 'error' ? prev : 'loading'))

    void loadAnalyticsArchive(useSessionStore.getState().sessions).then((result) => {
      if (cancelled || loadKeyRef.current !== endedLocalSessionKey) return
      setArchivedMap(result.archivedMap)
      setLoadPhase(result.error ? 'error' : 'ready')
    })

    return () => {
      cancelled = true
    }
  }, [endedLocalSessionKey])

  const mergedSessions = useMemo(
    () => mergeAnalyticsSessionSources(localEndedSessions, Object.values(archivedMap)),
    [localEndedSessions, archivedMap],
  )

  const archiveReady = loadPhase === 'ready'
  const archiveError = loadPhase === 'error'
  const analyticsSettled =
    loadPhase === 'ready' ||
    loadPhase === 'error' ||
    archiveReachable === false

  const allEnded = useMemo(() => listAllEndedSessions(mergedSessions), [mergedSessions])
  const filtered = useMemo(() => {
    const base = filterAnalyticsSessions(mergedSessions, filters)
    const preset = getWorkflowPreset(workflowPresetId)
    if (!preset?.sessionPredicate) return base
    return base.filter(preset.sessionPredicate)
  }, [mergedSessions, filters, workflowPresetId])
  const summary = useMemo(
    () => computeSessionAnalytics(filtered, allEnded.length),
    [filtered, allEnded.length],
  )

  return {
    sessions: mergedSessions,
    localSessions: localEndedSessions,
    allEnded,
    filtered,
    filters,
    setFilters,
    summary,
    searchParams,
    archiveReady,
    archiveError,
    analyticsSettled,
    archiveSessionCount: Object.keys(archivedMap).length,
    workflowPresetId,
  }
}
