/**
 * Phase 3C.1 stabilization checks. Run: npx tsx scripts/phase3c1-stabilization-check.ts
 */
import { mockScenarios } from '../src/data/scenariosCatalog'
import { listRuntimeScenarios, getScenarioById } from '../src/data/scenarioRegistry'
import { authoredConfigToRuntimeScenario } from '../src/features/scenario-authoring/scenarioConfigToRuntime'
import { createDefaultScenarioConfig } from '../src/features/scenario-authoring/defaultScenarioTemplate'
import {
  buildExportBundle,
  listPublishedAuthoredConfigs,
} from '../src/features/scenario-authoring/scenarioAuthoringPersistence'
import {
  hydrateRegistryCache,
  importScenarioDocuments,
  listScenarioVersions,
  upsertScenarioDocument,
} from '../src/registry/registryCache'
import { parseScenarioConfigImportPayload } from '../src/features/scenario-authoring/parseImportPayload'
import {
  validateImportDocuments,
  validateScenarioConfig,
  validateScenarioConfigForSave,
} from '../src/features/scenario-authoring/validateScenarioConfig'
function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

function resetCache(): void {
  hydrateRegistryCache({ schemaVersion: 1, scenarios: {}, riskRules: {} })
}

function publishScenarioInCache(scenarioId: string, version: number): void {
  const now = new Date().toISOString()
  for (const v of listScenarioVersions(scenarioId)) {
    if (v.version === version) {
      upsertScenarioDocument({ ...v, status: 'published', updatedAt: now })
    } else if (v.status === 'published') {
      upsertScenarioDocument({ ...v, status: 'draft', updatedAt: now })
    }
  }
}

function testValidation(): void {
  const doc = createDefaultScenarioConfig('test_custom_banking', 'banking')
  doc.metadata.title = 'T'
  doc.metadata.description = 'D'
  doc.metadata.expectedRiskFlags = ['ignored_warning']

  assert(validateScenarioConfig(doc).valid, 'valid custom doc')

  const badId = { ...doc, scenarioId: 'Invalid-ID' }
  assert(!validateScenarioConfig(badId).valid, 'invalid id pattern')

  const builtinConflict = { ...doc, scenarioId: mockScenarios[0].id }
  assert(!validateScenarioConfig(builtinConflict).valid, 'builtin id blocked')

  const badNext = structuredClone(doc)
  badNext.steps[0].nextByAction.continue = 'nonexistent_step'
  assert(!validateScenarioConfig(badNext).valid, 'invalid nextByAction')

  const badScreen = structuredClone(doc)
  badScreen.steps[0].screenId = 'not_a_screen'
  assert(!validateScenarioConfig(badScreen).valid, 'invalid screenId')
}

function testPersistenceAndRegistry(): void {
  resetCache()
  const doc = createDefaultScenarioConfig('hub_visible_scenario', 'banking')
  doc.metadata.title = 'Hub Test'
  doc.metadata.description = 'Desc'
  doc.metadata.expectedRiskFlags = ['ignored_warning']
  doc.metadata.targetProfileIds = ['normal_user']

  upsertScenarioDocument(doc)
  let published = listPublishedAuthoredConfigs()
  assert(published.length === 0, 'draft not in runtime')

  publishScenarioInCache(doc.scenarioId, doc.version)
  published = listPublishedAuthoredConfigs()
  assert(published.length === 1, 'published in store')

  const runtime = listRuntimeScenarios()
  assert(runtime.some((s) => s.id === 'hub_visible_scenario'), 'published in runtime catalog')
  assert(runtime.length === mockScenarios.length + 1, 'builtin + authored')

  const builtin = getScenarioById(mockScenarios[0].id)
  assert(builtin?.title === mockScenarios[0].title, 'builtin unchanged')

  const authoredRuntime = getScenarioById('hub_visible_scenario')
  assert(authoredRuntime?.steps.length === doc.steps.length, 'steps mapped')
}

function testImportExport(): void {
  resetCache()
  const doc = createDefaultScenarioConfig('import_roundtrip', 'wallet')
  doc.metadata.title = 'Import'
  doc.metadata.description = 'Import desc'
  doc.metadata.expectedRiskFlags = ['recovery_phrase_entered']

  const bundle = buildExportBundle([doc])
  const parsed = parseScenarioConfigImportPayload(bundle)
  assert(parsed?.length === 1, 'bundle parse')

  const single = parseScenarioConfigImportPayload(doc)
  assert(single?.length === 1, 'single document parse')

  assert(parseScenarioConfigImportPayload({ bad: true }) === null, 'corrupt rejected')
  assert(parseScenarioConfigImportPayload([{ foo: 1 }]) === null, 'partial array rejected')

  const validation = validateImportDocuments(parsed!)
  assert(validation.valid, 'import validation')
  importScenarioDocuments(parsed!)
  assert(
    listPublishedAuthoredConfigs().length === 0,
    'imported draft not published until publish',
  )
}

function testScenarioIdRename(): void {
  resetCache()
  const doc = createDefaultScenarioConfig('rename_me', 'banking')
  doc.metadata.title = 'T'
  doc.metadata.description = 'D'
  doc.metadata.expectedRiskFlags = ['ignored_warning']
  upsertScenarioDocument(doc)

  const renamed = { ...doc, scenarioId: 'renamed_scenario' }
  upsertScenarioDocument(renamed, { previousScenarioId: 'rename_me' })

  const runtime = listRuntimeScenarios()
  assert(!runtime.some((s) => s.id === 'rename_me'), 'old id orphan not in runtime after rename')
}

testValidation()
testPersistenceAndRegistry()
testImportExport()
testScenarioIdRename()
console.log('All Phase 3C.1 stabilization checks passed.')
