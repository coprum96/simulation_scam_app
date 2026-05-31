import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRuntimeScenarios } from '../../data/scenarios'
import {
  DEFAULT_SCENARIO_FILTERS,
  matchesScenarioFilters,
  ROUTES,
  SCREEN_IDS,
  type ScenarioFilterState,
} from '../../config'
import { ru } from '../../content/ru'
import { PageHeader } from '../../components/layout/PageHeader'
import { ResearcherHint } from '../../components/layout/ResearcherHint'
import { GuidedEmptyState } from '../../components/layout/GuidedEmptyState'
import { ResearcherSectionOverview } from '../../components/layout/ResearcherSectionOverview'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ScenarioFilters } from './ScenarioFilters'
import { ScenarioCard } from './ScenarioCard'
import { ProfileSelect } from './ProfileSelect'
import { useScenarioLaunch } from './useScenarioLaunch'
import { useSessionStore } from '../telemetry/sessionStore'
import { useScreenViewOnMount, useTelemetry } from '../telemetry'
import { LastSessionRiskPanel } from '../../components/risk/LastSessionRiskPanel'
import { subscribeRegistryBootstrap } from '../../registry/bootstrapRegistry'
import { useScenarioAuthoringStore } from '../scenario-authoring/scenarioAuthoringStore'
import {
  PostSimulationPanel,
  ResearchWorkflowPanel,
  shouldShowExpandedWorkflow,
} from '../research-workflow'
import type { Session } from '../../types/contracts'

export function ScenarioHubPage() {
  const [filters, setFilters] = useState<ScenarioFilterState>(DEFAULT_SCENARIO_FILTERS)
  const selectedProfileId = useSessionStore((s) => s.selectedProfileId)
  const clearActiveSession = useSessionStore((s) => s.clearActiveSession)
  const sessions = useSessionStore((s) => s.sessions)
  const getSession = useSessionStore((s) => s.getSession)
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const authoringRefreshKey = useScenarioAuthoringStore((s) => s.refreshKey)
  const refreshAuthoring = useScenarioAuthoringStore((s) => s.refresh)

  useEffect(() => {
    return subscribeRegistryBootstrap(() => refreshAuthoring())
  }, [refreshAuthoring])

  const lastEndedSession: Session | null = useMemo(() => {
    const ended = Object.values(sessions)
      .filter((s) => s.record.status === 'ended')
      .sort((a, b) => (b.record.endedAt ?? 0) - (a.record.endedAt ?? 0))
    return ended[0] ?? null
  }, [sessions])
  const endedSessionCount = useMemo(
    () => Object.values(sessions).filter((s) => s.record.status === 'ended').length,
    [sessions],
  )
  const { launchScenario } = useScenarioLaunch()
  const { logButtonClick } = useTelemetry(SCREEN_IDS.scenarioHub)
  useScreenViewOnMount(SCREEN_IDS.scenarioHub)

  useEffect(() => {
    if (!activeSessionId) return
    const session = getSession(activeSessionId)
    if (session?.record.status === 'ended') {
      clearActiveSession()
    }
  }, [activeSessionId, clearActiveSession, getSession])

  const filtered = useMemo(
    () => listRuntimeScenarios().filter((s) => matchesScenarioFilters(s, filters)),
    [filters, authoringRefreshKey],
  )

  const handleStart = (scenarioId: string) => {
    logButtonClick('start_scenario', { scenarioId })
    launchScenario(scenarioId)
  }

  return (
    <div>
      <PageHeader
        eyebrow={ru.nav.groupStudy}
        title={ru.screens.scenarios}
        description={ru.app.subtitle}
        actions={
          lastEndedSession ? (
            <Link to={ROUTES.dashboard}>
              <Button variant="secondary">{ru.nav.analytics}</Button>
            </Link>
          ) : undefined
        }
      />

      <ResearcherHint>{ru.researcher.hubHint}</ResearcherHint>

      <ResearchWorkflowPanel
        pageStep="simulate"
        hasAnySessions={endedSessionCount > 0}
        compact={!shouldShowExpandedWorkflow()}
      />

      <PostSimulationPanel session={lastEndedSession} />

      <ResearcherSectionOverview />

      <div className="grid gap-5 md:grid-cols-[280px_1fr] md:gap-6">
        <aside className="space-y-4">
          <Card>
            <ProfileSelect />
          </Card>
          <Card>
            <ScenarioFilters value={filters} onChange={setFilters} />
          </Card>
          <LastSessionRiskPanel session={lastEndedSession} />
        </aside>

        <section>
          <p className="mb-4 text-sm text-slate-600">
            {filtered.length} {ru.hub.scenariosCount}
          </p>

          {filtered.length === 0 ? (
            <GuidedEmptyState
              title={ru.researcher.hubEmptyTitle}
              message={ru.hub.noScenarios}
              steps={ru.researcher.hubEmptySteps}
            >
              <Button variant="secondary" onClick={() => setFilters(DEFAULT_SCENARIO_FILTERS)}>
                {ru.hub.resetFilters}
              </Button>
            </GuidedEmptyState>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  profileSupported={scenario.targetProfileIds.includes(selectedProfileId)}
                  onStart={handleStart}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
