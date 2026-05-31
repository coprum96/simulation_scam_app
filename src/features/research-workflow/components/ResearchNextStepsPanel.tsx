import { Link } from 'react-router-dom'
import { ROUTES, sessionReplayPath } from '../../../config'
import { ru } from '../../../content/ru'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import type { Session } from '../../../types/contracts'
import { sessionRiskLevel } from '../../dashboard/dashboardFilters'
import {
  analyticsComparePath,
  analyticsDashboardPath,
  analyticsScenarioDrilldownPath,
  analyticsSessionExplainPath,
} from '../../analytics/analyticsPaths'
import type { AnalyticsFilterState } from '../../analytics/analyticsFilters'
import { markAnalyticsVisited, markCompareVisited } from '../workflowStorage'
import { notifyWorkflowChange } from '../useInvestigationMarkers'

type ResearchNextStepsPanelProps = {
  variant: 'hub' | 'analytics' | 'explain' | 'replay'
  session?: Session | null
  filters?: AnalyticsFilterState
  highRiskCount?: number
}

export function ResearchNextStepsPanel({
  variant,
  session,
  filters,
  highRiskCount = 0,
}: ResearchNextStepsPanelProps) {
  const sessionId = session?.record.sessionId
  const isHighRisk = session ? sessionRiskLevel(session) === 'high' : false

  let title: string = ru.researcher.workflow.nextStepsTitle
  let message: string = ru.researcher.workflow.nextStepsDefault

  if (variant === 'hub') {
    title = ru.researcher.workflow.postSimTitle
    message = ru.researcher.workflow.postSimMessage
  } else if (variant === 'analytics') {
    message =
      highRiskCount > 0
        ? ru.researcher.workflow.nextStepsAnalyticsHighRisk(highRiskCount)
        : ru.researcher.workflow.nextStepsAnalytics
  } else if (variant === 'explain') {
    message = ru.researcher.workflow.nextStepsExplain
  } else if (variant === 'replay') {
    message = ru.researcher.workflow.nextStepsReplay
  }

  return (
    <Card className="border-slate-200 bg-slate-50/60 p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {variant === 'hub' && sessionId ? (
          <>
            <Link
              to={analyticsDashboardPath()}
              onClick={() => {
                markAnalyticsVisited()
                notifyWorkflowChange()
              }}
            >
              <Button>{ru.researcher.workflow.ctaOpenAnalytics}</Button>
            </Link>
            <Link to={sessionReplayPath(sessionId)}>
              <Button variant="secondary">{ru.researcher.workflow.ctaOpenReplay}</Button>
            </Link>
            {isHighRisk ? (
              <Link to={analyticsSessionExplainPath(sessionId)}>
                <Button variant="secondary">{ru.researcher.workflow.ctaOpenExplain}</Button>
              </Link>
            ) : null}
          </>
        ) : null}

        {variant === 'analytics' ? (
          <>
            {highRiskCount > 0 ? (
              <a href="#high-risk-sessions">
                <Button>{ru.researcher.workflow.ctaReviewHighRisk}</Button>
              </a>
            ) : null}
            <Link
              to={analyticsComparePath({ mode: 'scenario' }, filters)}
              onClick={() => {
                markCompareVisited()
                notifyWorkflowChange()
              }}
            >
              <Button variant="secondary">{ru.researcher.workflow.ctaCompare}</Button>
            </Link>
            <Link to={ROUTES.scenarios}>
              <Button variant="secondary">{ru.researcher.workflow.ctaNewSimulation}</Button>
            </Link>
          </>
        ) : null}

        {variant === 'explain' && sessionId ? (
          <>
            <Link to={sessionReplayPath(sessionId)}>
              <Button>{ru.researcher.workflow.ctaOpenReplay}</Button>
            </Link>
            <Link to={analyticsDashboardPath(filters)}>
              <Button variant="secondary">{ru.actions.backToAnalytics}</Button>
            </Link>
            {session?.record.scenarioId ? (
              <Link to={analyticsScenarioDrilldownPath(session.record.scenarioId, filters)}>
                <Button variant="secondary">{ru.researcher.workflow.ctaOpenScenario}</Button>
              </Link>
            ) : null}
          </>
        ) : null}

        {variant === 'replay' && sessionId ? (
          <>
            {isHighRisk ? (
              <Link to={analyticsSessionExplainPath(sessionId, filters)}>
                <Button>{ru.researcher.workflow.ctaOpenExplain}</Button>
              </Link>
            ) : null}
            <Link to={analyticsDashboardPath(filters)}>
              <Button variant="secondary">{ru.actions.backToAnalytics}</Button>
            </Link>
            <Link to={ROUTES.scenarios}>
              <Button variant="secondary">{ru.researcher.workflow.ctaNewSimulation}</Button>
            </Link>
          </>
        ) : null}
      </div>
    </Card>
  )
}
