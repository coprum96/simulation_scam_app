import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ru } from '../../../content/ru'
import { PageHeader } from '../../../components/layout/PageHeader'
import { PageBackActions } from '../../../components/layout/PageBackActions'
import { ResearcherHint } from '../../../components/layout/ResearcherHint'
import { analyticsDashboardPath } from '../analyticsPaths'
import { computeSessionExplainability } from '../computeDrilldownViews'
import { AnalyticsBreadcrumbs } from '../components/AnalyticsBreadcrumbs'
import {
  AnalyticsExplainSessionNotFoundState,
  AnalyticsExplainUnavailableState,
  AnalyticsPageGate,
} from '../components/AnalyticsPageEmptyStates'
import { SessionExplainabilityPanel } from '../components/SessionExplainabilityPanel'
import { useAnalyticsSessions } from '../useAnalyticsSessions'
import {
  markExplainVisited,
  ResearchNextStepsPanel,
  ResearchWorkflowPanel,
  SessionInvestigationBar,
  shouldShowExpandedWorkflow,
} from '../../research-workflow'

export function AnalyticsSessionExplainPage() {
  const { sessionId = '' } = useParams()
  const { allEnded, sessions, filters, analyticsSettled } = useAnalyticsSessions()

  const session = sessionId ? sessions[sessionId] : undefined
  const explain = useMemo(() => computeSessionExplainability(session), [session])

  useEffect(() => {
    if (!sessionId || !session) return
    markExplainVisited(sessionId)
  }, [sessionId, session])

  return (
    <div>
      <AnalyticsBreadcrumbs
        items={[{ label: ru.analytics.drilldownSession(sessionId.slice(0, 8)) }]}
        filters={filters}
      />

      <PageHeader
        eyebrow={ru.nav.groupStudy}
        title={ru.analytics.explainPageTitle}
        description={ru.analytics.explainPageDescription}
        actions={
          <PageBackActions
            analyticsTo={analyticsDashboardPath(filters)}
            showAnalytics
            showSimulations={false}
          />
        }
      />

      <AnalyticsPageGate analyticsSettled={analyticsSettled} allEndedCount={allEnded.length}>
        {!session || session.record.status !== 'ended' ? (
          <AnalyticsExplainSessionNotFoundState />
        ) : !explain ? (
          <AnalyticsExplainUnavailableState />
        ) : (
          <>
            <ResearchWorkflowPanel
              pageStep="investigate"
              hasAnySessions={allEnded.length > 0}
              compact={!shouldShowExpandedWorkflow()}
            />
            <ResearcherHint tone="muted">{ru.researcher.explainHint}</ResearcherHint>
            <SessionInvestigationBar session={session} filters={filters} />
            <SessionExplainabilityPanel explain={explain} filters={filters} />
            <div className="mt-6">
              <ResearchNextStepsPanel variant="explain" session={session} filters={filters} />
            </div>
          </>
        )}
      </AnalyticsPageGate>
    </div>
  )
}
