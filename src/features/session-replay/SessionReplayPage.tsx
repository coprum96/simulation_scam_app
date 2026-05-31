import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ru } from '../../content/ru'
import { PageHeader } from '../../components/layout/PageHeader'
import { PageBackActions } from '../../components/layout/PageBackActions'
import { ResearcherHint } from '../../components/layout/ResearcherHint'
import { GuidedEmptyState } from '../../components/layout/GuidedEmptyState'
import { ExportJsonButton } from '../../components/export/ExportJsonButton'
import { exportSessionJson } from '../export'
import { useReplaySession } from './useReplaySession'
import { ReplayMetadataBlock } from './components/ReplayMetadataBlock'
import { ReplaySummaryBlock } from './components/ReplaySummaryBlock'
import { ReplayRiskSummaryBlock } from './components/ReplayRiskSummaryBlock'
import { ReplayEventTimeline } from './components/ReplayEventTimeline'
import {
  markReplayVisited,
  ResearchNextStepsPanel,
  ResearchWorkflowPanel,
  SessionInvestigationBar,
  shouldShowExpandedWorkflow,
} from '../research-workflow'
import { useAnalyticsSessions } from '../analytics/useAnalyticsSessions'

export function SessionReplayPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { session, source, loading } = useReplaySession(sessionId)
  const { allEnded, filters, analyticsSettled } = useAnalyticsSessions()

  useEffect(() => {
    if (!sessionId || !session) return
    markReplayVisited(sessionId)
  }, [sessionId, session])

  if (!sessionId || loading) {
    return (
      <div>
        <PageHeader eyebrow={ru.nav.groupStudy} title={ru.replay.pageTitle} />
        <GuidedEmptyState
          title={loading ? ru.replay.pageTitle : ru.researcher.replayNotFoundTitle}
          message={loading ? ru.archive.replayLoading : ru.errors.sessionNotFound}
          steps={loading ? undefined : ru.researcher.replayNotFoundSteps}
        />
        <div className="mt-4">
          <PageBackActions showAnalytics showSimulations />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div>
        <PageHeader eyebrow={ru.nav.groupStudy} title={ru.replay.pageTitle} />
        <GuidedEmptyState
          title={ru.researcher.replayNotFoundTitle}
          message={ru.errors.sessionNotFound}
          steps={ru.researcher.replayNotFoundSteps}
        />
        <div className="mt-4">
          <PageBackActions showAnalytics showSimulations />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow={ru.nav.groupStudy}
        title={ru.replay.pageTitle}
        description={
          source === 'archive' ? ru.archive.replayFromArchive : ru.replay.pageDescription
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportJsonButton
              label={ru.export.exportSessionJson}
              onClick={() => exportSessionJson(session)}
            />
            <PageBackActions showAnalytics showSimulations />
          </div>
        }
      />

      {analyticsSettled ? (
        <ResearchWorkflowPanel
          pageStep="investigate"
          hasAnySessions={allEnded.length > 0}
          compact={!shouldShowExpandedWorkflow()}
        />
      ) : null}

      <ResearcherHint tone="muted">{ru.researcher.replayHint}</ResearcherHint>
      <SessionInvestigationBar session={session} filters={filters} showNote={false} />

      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          <ReplayMetadataBlock record={session.record} />
          <ReplaySummaryBlock summary={session.summary} />
        </div>

        <ReplayRiskSummaryBlock session={session} />
        <ReplayEventTimeline events={session.events} />
      </div>

      <div className="mt-6">
        <ResearchNextStepsPanel variant="replay" session={session} filters={filters} />
      </div>
    </div>
  )
}
