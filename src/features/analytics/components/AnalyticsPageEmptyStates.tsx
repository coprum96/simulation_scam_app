import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config'
import { ru } from '../../../content/ru'
import { GuidedEmptyState } from '../../../components/layout/GuidedEmptyState'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Button } from '../../../components/ui/Button'

export function AnalyticsLoadingState() {
  return <EmptyState message={ru.archive.analyticsLoadingArchive} />
}

export function AnalyticsNoEndedState() {
  return (
    <GuidedEmptyState
      title={ru.researcher.analyticsEmptyTitle}
      message={ru.analytics.emptyEnded}
      steps={ru.researcher.analyticsEmptySteps}
    >
      <Link to={ROUTES.scenarios}>
        <Button>{ru.nav.simulations}</Button>
      </Link>
    </GuidedEmptyState>
  )
}

export function AnalyticsFilteredEmptyState() {
  return (
    <GuidedEmptyState
      title={ru.researcher.analyticsFilteredEmptyTitle}
      message={ru.researcher.analyticsFilteredEmptyMessage}
      steps={ru.researcher.analyticsFilteredEmptySteps}
    />
  )
}

export function AnalyticsDrilldownEmptyState() {
  return (
    <GuidedEmptyState
      title={ru.researcher.drilldownEmptyTitle}
      message={ru.analytics.drilldownNoSessions}
      steps={ru.researcher.drilldownEmptySteps}
    />
  )
}

export function AnalyticsExplainSessionNotFoundState() {
  return (
    <GuidedEmptyState
      title={ru.researcher.replayNotFoundTitle}
      message={ru.analytics.explainSessionNotFound}
      steps={ru.researcher.explainNotFoundSteps}
    />
  )
}

export function AnalyticsExplainUnavailableState() {
  return (
    <GuidedEmptyState
      title={ru.analytics.explainPageTitle}
      message={ru.analytics.explainUnavailable}
      steps={ru.researcher.explainUnavailableSteps}
    />
  )
}

export function AnalyticsCompareInsufficientState() {
  return (
    <GuidedEmptyState
      title={ru.analytics.compareTitle}
      message={ru.analytics.compareInsufficient}
      steps={ru.researcher.compareInsufficientSteps}
    />
  )
}

type AnalyticsPageGateProps = {
  analyticsSettled: boolean
  allEndedCount: number
  children: ReactNode
}

export function AnalyticsPageGate({
  analyticsSettled,
  allEndedCount,
  children,
}: AnalyticsPageGateProps) {
  if (!analyticsSettled) return <AnalyticsLoadingState />
  if (allEndedCount === 0) return <AnalyticsNoEndedState />
  return <>{children}</>
}
