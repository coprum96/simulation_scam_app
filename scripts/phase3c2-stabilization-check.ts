/**
 * Phase 3C.2 stabilization checks. Run: npx tsx scripts/phase3c2-stabilization-check.ts
 */
import { createDefaultScenarioConfig } from '../src/features/scenario-authoring/defaultScenarioTemplate'
import { normalizeScenarioConfigDocument } from '../src/features/scenario-authoring/normalizeScenarioConfig'
import { buildScenarioFlowPreview } from '../src/features/scenario-authoring/scenarioFlowAnalysis'
import {
  duplicateStepAt,
  removeStepAt,
  renameStepIdInSteps,
  reorderStep,
} from '../src/features/scenario-authoring/stepEditorUtils'
import { validateScenarioConfigFull } from '../src/features/scenario-authoring/validateScenarioConfigFull'
import { listBuiltinScenarioIds } from '../src/features/scenario-authoring/builtinScenarioToConfig'

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

function testRenameStepIdRemapsBranches(): void {
  let doc = createDefaultScenarioConfig('test_rename', 'banking')
  doc.metadata.title = 'T'
  doc.metadata.description = 'D'
  doc.metadata.expectedRiskFlags = ['ignored_warning']
  doc.steps[0].nextByAction.continue = doc.steps[1].stepId

  const renamed = renameStepIdInSteps(doc.steps, 1, 'review', 'banking')
  assert(renamed[0].nextByAction.continue === 'review', 'branch target renamed with stepId')

  doc = { ...doc, steps: renamed }
  const validation = validateScenarioConfigFull(doc, listBuiltinScenarioIds())
  assert(!validation.blocking.some((i) => i.messageKey === 'nextStepInvalid'), 'no dangling branch')
}

function testDeleteClearsMultipleReferences(): void {
  const doc = createDefaultScenarioConfig('test_delete', 'banking')
  const targetId = doc.steps[doc.steps.length - 1].stepId
  doc.steps[0].nextByAction.continue = targetId
  if (doc.steps[1]) doc.steps[1].nextByAction.continue = targetId

  const removed = removeStepAt(doc.steps, doc.steps.length - 1)
  assert(
    removed.every((s) => Object.values(s.nextByAction).every((t) => t !== targetId)),
    'all refs to deleted step cleared',
  )
}

function testReorderUpdatesLinearPreview(): void {
  const doc = createDefaultScenarioConfig('test_reorder', 'banking')
  const reordered = reorderStep(doc.steps, 0, 2)
  const flow = buildScenarioFlowPreview({ ...doc, steps: reordered })
  assert(flow.linearRuntimePath[0] === reordered[0].stepId, 'preview follows reorder')
}

function testValidationLiveAfterBranchEdit(): void {
  const doc = createDefaultScenarioConfig('test_live_validation', 'banking')
  doc.metadata.title = 'T'
  doc.metadata.description = 'D'
  doc.metadata.expectedRiskFlags = ['ignored_warning']
  doc.steps[0].nextByAction.continue = 'invalid_step_id'

  const blocked = validateScenarioConfigFull(doc, listBuiltinScenarioIds())
  assert(!blocked.canPublish, 'publish blocked on invalid branch')

  doc.steps[0].nextByAction.continue = ''
  const cleared = validateScenarioConfigFull(doc, listBuiltinScenarioIds())
  assert(
    !cleared.blocking.some((i) => i.messageKey === 'nextStepInvalid'),
    'blocking clears after fix without reload',
  )
}

function testLegacyImportNormalize(): void {
  const doc = createDefaultScenarioConfig('legacy', 'banking')
  const legacy = {
    ...doc,
    steps: doc.steps.map((step, index) =>
      index === 0
        ? {
            ...step,
            nextByAction: { continue: step.nextByAction.continue, orphan_key: 'transfer' },
          }
        : step,
    ),
  }
  const normalized = normalizeScenarioConfigDocument(legacy)
  assert(!('orphan_key' in normalized.steps[0].nextByAction), 'orphan nextByAction keys removed')
  assert(normalized.steps[0].nextByAction.continue !== undefined, 'action keys preserved')
}

function testBrokenTransitionPreview(): void {
  const doc = createDefaultScenarioConfig('broken_branch', 'banking')
  doc.steps[0].nextByAction.continue = 'nonexistent_step'
  const flow = buildScenarioFlowPreview(doc)
  assert(flow.transitions.some((t) => t.isBroken), 'broken transition flagged')
  const validation = validateScenarioConfigFull(doc, listBuiltinScenarioIds())
  assert(validation.blocking.some((i) => i.messageKey === 'nextStepInvalid'), 'blocking invalid branch')
}

function testStepIdExhaustion(): void {
  const doc = createDefaultScenarioConfig('exhaust', 'banking')
  let steps = doc.steps
  let result = duplicateStepAt(steps, 0, 'banking')
  while (!result.error) {
    steps = result.steps
    result = duplicateStepAt(steps, 0, 'banking')
  }
  assert(result.error === 'all_steps_used', 'duplicate stops when ids exhausted')
}

testRenameStepIdRemapsBranches()
testDeleteClearsMultipleReferences()
testReorderUpdatesLinearPreview()
testValidationLiveAfterBranchEdit()
testLegacyImportNormalize()
testBrokenTransitionPreview()
testStepIdExhaustion()
console.log('All Phase 3C.2 stabilization checks passed.')
