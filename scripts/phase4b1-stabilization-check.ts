/**
 * Phase 4B.1 researcher UX stabilization checks.
 * Run: npm run check:phase4b1
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ru } from '../src/content/ru'

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

function testRuContentKeys(): void {
  assert(ru.actions.backToAnalytics === 'К аналитике', 'actions.backToAnalytics')
  assert(ru.actions.backToSimulations === 'К симуляциям', 'actions.backToSimulations')
  assert(ru.nav.ariaLabel.length > 0, 'nav.ariaLabel')
  assert(ru.researcher.sections.simulations.title === 'Симуляции', 'sections.simulations')
  assert(ru.researcher.sectionOverviewTitle.length > 0, 'sectionOverviewTitle')
  assert(ru.researcher.analyticsFilteredEmptySteps.length >= 2, 'analyticsFilteredEmptySteps')
  assert(ru.researcher.drilldownEmptySteps.length >= 2, 'drilldownEmptySteps')
  assert(ru.researcher.explainNotFoundSteps.length >= 2, 'explainNotFoundSteps')
  assert(ru.researcher.replayNotFoundSteps.length >= 2, 'replayNotFoundSteps')
  assert(ru.researcher.authoringEmptySteps.length >= 2, 'authoringEmptySteps')
  assert(ru.researcher.rulesEmptySteps.length >= 2, 'rulesEmptySteps')
}

async function testSharedUxComponentsExist(): Promise<void> {
  const files = [
    'src/components/layout/PageBackActions.tsx',
    'src/components/layout/ResearcherSectionOverview.tsx',
    'src/features/analytics/components/AnalyticsPageEmptyStates.tsx',
  ]
  for (const file of files) {
    assert(await fileExists(file), `missing ${file}`)
  }
}

async function testPageWiring(): Promise<void> {
  const hub = await read('src/features/scenarios/ScenarioHubPage.tsx')
  assert(hub.includes('ResearcherSectionOverview'), 'hub uses ResearcherSectionOverview')

  const appNav = await read('src/components/layout/AppNav.tsx')
  assert(appNav.includes('simulationsHelp'), 'AppNav tooltips')
  assert(appNav.includes('aria-label'), 'AppNav aria-label')

  const explain = await read('src/features/analytics/pages/AnalyticsSessionExplainPage.tsx')
  assert(explain.includes('PageBackActions'), 'explain PageBackActions')
  assert(explain.includes('AnalyticsPageGate'), 'explain AnalyticsPageGate')
  assert(explain.includes('ResearcherHint'), 'explain ResearcherHint')
  assert(!explain.includes('replayBackToAnalytics'), 'explain no legacy back key')

  const compare = await read('src/features/analytics/pages/AnalyticsComparePage.tsx')
  assert(compare.includes('AnalyticsFilteredEmptyState'), 'compare filtered empty')
  assert(compare.includes('AnalyticsCompareInsufficientState'), 'compare insufficient empty')

  const replay = await read('src/features/session-replay/SessionReplayPage.tsx')
  assert(replay.includes('PageBackActions'), 'replay PageBackActions')
  assert(replay.includes('GuidedEmptyState'), 'replay GuidedEmptyState')
  assert(!replay.includes('replayBackToAnalytics'), 'replay no legacy back key')

  for (const drilldown of [
    'AnalyticsScenarioDrilldownPage.tsx',
    'AnalyticsFlagDrilldownPage.tsx',
    'AnalyticsRuleDrilldownPage.tsx',
  ]) {
    const src = await read(`src/features/analytics/pages/${drilldown}`)
    assert(src.includes('AnalyticsDrilldownEmptyState'), `${drilldown} drilldown empty`)
    assert(src.includes('analyticsDashboardPath(filters)'), `${drilldown} preserves filters`)
  }

  const authoring = await read('src/features/scenario-authoring/ScenarioAuthoringListPage.tsx')
  assert(authoring.includes('authoringEmptySteps'), 'authoring empty steps')
  assert(authoring.includes('ru.actions.backToSimulations'), 'authoring unified back CTA')

  const rules = await read('src/features/risk-rule-authoring/RiskRuleAuthoringListPage.tsx')
  assert(rules.includes('rulesEmptySteps'), 'rules empty steps')
}

async function testNoStaleReferences(): Promise<void> {
  const srcFiles = await fs.readdir(path.join(root, 'src'), { recursive: true })
  const tsxFiles = (srcFiles as string[])
    .filter((f) => typeof f === 'string' && f.endsWith('.tsx'))
    .map((f) => path.join('src', f))

  for (const file of tsxFiles) {
    const content = await read(file)
    assert(!content.includes('replayBackToAnalytics'), `${file} references replayBackToAnalytics`)
  }
}

async function main(): Promise<void> {
  testRuContentKeys()
  await testSharedUxComponentsExist()
  await testPageWiring()
  await testNoStaleReferences()
  console.log('Phase 4B.1 stabilization checks passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
