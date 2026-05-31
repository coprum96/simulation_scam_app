/**
 * Phase 4B.2 guided research workflow checks.
 * Run: npm run check:phase4b2
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ru } from '../src/content/ru'
import { computeWorkflowProgress } from '../src/features/research-workflow/computeWorkflowProgress'
import { getWorkflowPreset, hasSessionFlag, isWorkflowPresetId } from '../src/features/research-workflow/workflowPresets'
import { resetWorkflowStorage, loadWorkflowStorage } from '../src/features/research-workflow/workflowStorage'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

async function read(relativePath: string): Promise<string> {
  return fs.readFile(path.join(root, relativePath), 'utf8')
}

async function fileExists(relativePath: string): Promise<boolean> {
  try {
    await fs.access(path.join(root, relativePath))
    return true
  } catch {
    return false
  }
}

function testRuWorkflowKeys(): void {
  assert(ru.researcher.workflow.pathTitle.length > 0, 'workflow.pathTitle')
  assert(ru.researcher.workflow.steps.simulate.length > 0, 'workflow.steps.simulate')
  assert(ru.researcher.workflow.presets.highRisk.length > 0, 'workflow.presets.highRisk')
  assert(ru.researcher.workflow.markers.reviewed.length > 0, 'workflow.markers.reviewed')
}

function testWorkflowProgress(): void {
  resetWorkflowStorage()
  const empty = computeWorkflowProgress(false, 'simulate')
  assert(empty.currentStepId === 'simulate', 'empty starts at simulate')

  const withSessions = computeWorkflowProgress(true, 'analytics')
  assert(withSessions.hasAnySessions, 'has sessions')
  assert(withSessions.currentStepId === 'analytics', 'page step respected')
}

function testWorkflowPresets(): void {
  assert(isWorkflowPresetId('high_risk'), 'high_risk preset id')
  assert(!isWorkflowPresetId('unknown'), 'reject unknown preset')
  const preset = getWorkflowPreset('warning_dismiss')
  assert(preset?.sessionPredicate != null, 'warning_dismiss predicate')
  assert(
    preset?.sessionPredicate?.({
      record: {
        sessionId: 's1',
        scenarioId: 'a',
        profileId: 'p',
        simulatorType: 'banking',
        startedAt: 1,
        endedAt: 2,
        status: 'ended',
        outcome: 'completed',
        riskFlags: ['ignored_warning'],
      },
      events: [],
      summary: {
        sessionId: 's1',
        scenarioId: 'a',
        profileId: 'p',
        status: 'ended',
        startedAt: 1,
        endedAt: 2,
        totalDurationMs: 1,
        screensVisited: 1,
        totalEvents: 1,
        eventCounts: {} as never,
        warningsSeen: 1,
        warningsIgnored: 1,
        fieldEditCount: 0,
        backNavigationCount: 0,
        confirmationDelayMs: null,
        riskScore: 50,
        riskLevel: 'medium',
        riskFlags: ['ignored_warning'],
      },
    } as never),
    'warning dismiss matches flag',
  )
  assert(hasSessionFlag({ record: { riskFlags: ['ignored_warning'] } } as never, 'ignored_warning'), 'hasSessionFlag')
}

async function testModuleFiles(): Promise<void> {
  const files = [
    'src/features/research-workflow/types.ts',
    'src/features/research-workflow/workflowStorage.ts',
    'src/features/research-workflow/workflowPresets.ts',
    'src/features/research-workflow/components/ResearchWorkflowPanel.tsx',
    'src/features/research-workflow/components/ResearchNextStepsPanel.tsx',
    'src/features/research-workflow/components/ResearchQuickFilters.tsx',
    'src/features/research-workflow/components/SessionInvestigationBar.tsx',
  ]
  for (const file of files) {
    assert(await fileExists(file), `missing ${file}`)
  }
}

async function testPageWiring(): Promise<void> {
  const hub = await read('src/features/scenarios/ScenarioHubPage.tsx')
  assert(hub.includes('ResearchWorkflowPanel'), 'hub workflow panel')
  assert(hub.includes('PostSimulationPanel'), 'hub post simulation panel')

  const dashboard = await read('src/features/analytics/AnalyticsDashboardPage.tsx')
  assert(dashboard.includes('ResearchQuickFilters'), 'dashboard quick filters')
  assert(dashboard.includes('ResearchNextStepsPanel'), 'dashboard next steps')
  assert(dashboard.includes('high-risk-sessions'), 'high risk anchor')

  const explain = await read('src/features/analytics/pages/AnalyticsSessionExplainPage.tsx')
  assert(explain.includes('SessionInvestigationBar'), 'explain investigation bar')

  const replay = await read('src/features/session-replay/SessionReplayPage.tsx')
  assert(replay.includes('ResearchNextStepsPanel'), 'replay next steps')

  const searchParams = await read('src/features/analytics/analyticsSearchParams.ts')
  assert(searchParams.includes('wfPreset'), 'wfPreset param')
}

async function main(): Promise<void> {
  testRuWorkflowKeys()
  testWorkflowProgress()
  testWorkflowPresets()
  await testModuleFiles()
  await testPageWiring()
  resetWorkflowStorage()
  assert(loadWorkflowStorage().schemaVersion === 1, 'storage schema')
  console.log('Phase 4B.2 stabilization checks passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
