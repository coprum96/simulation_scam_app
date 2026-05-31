import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sessionReplayPath } from '../../../config'
import { ru } from '../../../content/ru'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import type { Session } from '../../../types/contracts'
import {
  analyticsRuleDrilldownPath,
  analyticsScenarioDrilldownPath,
  analyticsSessionExplainPath,
} from '../../analytics/analyticsPaths'
import type { AnalyticsFilterState } from '../../analytics/analyticsFilters'
import type { InvestigationMarker } from '../types'
import { useInvestigationMarkers } from '../useInvestigationMarkers'

type SessionInvestigationBarProps = {
  session: Session
  filters?: AnalyticsFilterState
  showNote?: boolean
}

const markerLabels: Record<InvestigationMarker, string> = {
  pending: ru.researcher.workflow.markers.pending,
  reviewed: ru.researcher.workflow.markers.reviewed,
  flagged: ru.researcher.workflow.markers.flagged,
}

const markerTone: Record<InvestigationMarker, string> = {
  pending: 'bg-slate-100 text-slate-700',
  reviewed: 'bg-teal-100 text-teal-900',
  flagged: 'bg-amber-100 text-amber-900',
}

export function SessionInvestigationBar({
  session,
  filters,
  showNote = true,
}: SessionInvestigationBarProps) {
  const sessionId = session.record.sessionId
  const { marker, note, setMarker, saveNote } = useInvestigationMarkers(sessionId)
  const [draftNote, setDraftNote] = useState(note)

  const topRuleId = session.riskReport?.assessment?.ruleHits?.[0]?.ruleId

  return (
    <Card className="mb-5 border-slate-200 bg-white p-4 sm:mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {ru.researcher.workflow.investigationTitle}
          </p>
          <p className="mt-1 text-xs text-slate-600">{ru.researcher.workflow.investigationHint}</p>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${markerTone[marker]}`}
        >
          {markerLabels[marker]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link to={analyticsSessionExplainPath(sessionId, filters)}>
          <Button variant="secondary" className="!min-h-9 text-xs">
            {ru.researcher.workflow.ctaOpenExplain}
          </Button>
        </Link>
        <Link to={sessionReplayPath(sessionId)}>
          <Button variant="secondary" className="!min-h-9 text-xs">
            {ru.researcher.workflow.ctaOpenReplay}
          </Button>
        </Link>
        <Link to={analyticsScenarioDrilldownPath(session.record.scenarioId, filters)}>
          <Button variant="secondary" className="!min-h-9 text-xs">
            {ru.researcher.workflow.ctaOpenScenario}
          </Button>
        </Link>
        {topRuleId ? (
          <Link to={analyticsRuleDrilldownPath(topRuleId, filters)}>
            <Button variant="secondary" className="!min-h-9 text-xs">
              {ru.researcher.workflow.ctaOpenRule}
            </Button>
          </Link>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(['pending', 'reviewed', 'flagged'] as InvestigationMarker[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMarker(value)}
            className={`inline-flex min-h-8 items-center rounded-full px-3 text-[11px] font-medium transition-colors ${
              marker === value
                ? 'bg-teal-700 text-white'
                : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {markerLabels[value]}
          </button>
        ))}
      </div>

      {showNote ? (
        <label className="mt-3 block text-xs">
          <span className="mb-1 block font-medium text-slate-700">
            {ru.researcher.workflow.noteLabel}
          </span>
          <textarea
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
            rows={2}
            maxLength={280}
            value={draftNote}
            placeholder={ru.researcher.workflow.notePlaceholder}
            onChange={(e) => setDraftNote(e.target.value)}
            onBlur={() => saveNote(draftNote)}
          />
        </label>
      ) : null}
    </Card>
  )
}

export function InvestigationMarkerBadge({ sessionId }: { sessionId: string }) {
  const { marker } = useInvestigationMarkers(sessionId)
  if (marker === 'pending') return null
  return (
    <span
      className={`ml-1 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${markerTone[marker]}`}
    >
      {markerLabels[marker]}
    </span>
  )
}
