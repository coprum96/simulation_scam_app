/**
 * Phase 3C.3 stabilization checks. Run: npx tsx scripts/phase3c3-stabilization-check.ts
 */
import { RISK_RULE_DELTAS } from '../src/config/riskRules'
import { resolveRuntimeRuleFlagId } from '../src/config/riskRuleAuthoring'
import { BUILTIN_RISK_RULE_DEFINITIONS } from '../src/features/risk-engine/builtinRiskRuleDefinitions'
import { getRuntimeRiskRules } from '../src/features/risk-engine/riskRuleRegistry'
import { riskRuleConfigToRuntime } from '../src/features/risk-engine/riskRuleConfigToRuntime'
import { builtinRiskRuleToConfig } from '../src/features/risk-rule-authoring/builtinRiskRuleToConfig'
import { buildRiskRulePreview } from '../src/features/risk-rule-authoring/riskRulePreview'
import { parseRiskRuleConfigImportPayload } from '../src/features/risk-rule-authoring/parseImportPayload'
import {
  buildExportBundle,
  getAuthoredDocument,
  listPublishedRiskRuleConfigs,
} from '../src/features/risk-rule-authoring/riskRuleAuthoringPersistence'
import { normalizeRiskRuleConfig } from '../src/features/risk-rule-authoring/normalizeRiskRuleConfig'
import {
  validateImportDocuments,
  validateRiskRuleConfig,
} from '../src/features/risk-rule-authoring/validateRiskRuleConfig'
import {
  hydrateRegistryCache,
  importRiskRuleDocuments,
  removeRiskRuleVersion,
  upsertRiskRuleDocument,
} from '../src/registry/registryCache'
import type { RiskRuleConfigDocument } from '../src/types/riskRuleConfig'

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

function resetCache(): void {
  hydrateRegistryCache({ schemaVersion: 1, scenarios: {}, riskRules: {} })
}

function publishRuleInCache(doc: RiskRuleConfigDocument): void {
  upsertRiskRuleDocument({
    ...doc,
    status: 'published',
    updatedAt: new Date().toISOString(),
  })
}

function testValidation(): void {
  const doc = builtinRiskRuleToConfig('ignored_warning')
  doc.status = 'draft'
  doc.title = 'T'
  doc.description = 'D'

  assert(validateRiskRuleConfig(doc).canSaveDraft, 'valid draft')

  assert(!validateRiskRuleConfig({ ...doc, ruleId: 'Bad-ID' }).canSaveDraft, 'invalid ruleId pattern')

  assert(
    !validateRiskRuleConfig({ ...doc, emittedRiskFlags: ['not_a_flag'] }).canSaveDraft,
    'invalid emitted flag',
  )

  assert(
    !validateRiskRuleConfig({ ...doc, scoreDelta: 500 }).canSaveDraft,
    'invalid scoreDelta',
  )

  assert(
    !validateRiskRuleConfig({ ...doc, enabled: false }, { forPublish: true }).canPublish,
    'disabled publish blocked',
  )

  assert(
    !validateRiskRuleConfig(
      { ...doc, ruleId: 'not_canonical_flag' },
      { forPublish: true },
    ).canPublish,
    'non-canonical ruleId blocked on publish',
  )
}

function testRegistryOverrideAndRollback(): void {
  resetCache()
  const builtinDelta = RISK_RULE_DELTAS.ignored_warning
  assert(
    getRuntimeRiskRules().find((r) => r.id === 'ignored_warning')?.delta === builtinDelta,
    'builtin delta baseline',
  )

  const override = builtinRiskRuleToConfig('ignored_warning')
  override.version = 1
  override.status = 'draft'
  override.title = 'Override'
  override.description = 'Override desc'
  override.scoreDelta = 42
  upsertRiskRuleDocument(override)
  assert(listPublishedRiskRuleConfigs().length === 0, 'draft not in published list')

  publishRuleInCache(override)
  const runtime = getRuntimeRiskRules().find((r) => r.id === 'ignored_warning')
  assert(runtime?.delta === 42, 'published override used at runtime')
  assert(runtime?.source === 'authored', 'override source authored')

  const disabled = { ...override, version: 2, status: 'draft' as const, enabled: false }
  upsertRiskRuleDocument(disabled)
  publishRuleInCache(disabled)
  const afterDisabled = getRuntimeRiskRules().find((r) => r.id === 'ignored_warning')
  assert(afterDisabled?.delta === builtinDelta, 'disabled published override skipped — builtin fallback')

  removeRiskRuleVersion('ignored_warning', 1)
  removeRiskRuleVersion('ignored_warning', 2)
  const rolledBack = getRuntimeRiskRules().find((r) => r.id === 'ignored_warning')
  assert(rolledBack?.delta === builtinDelta, 'rollback to builtin after delete published')
  assert(rolledBack?.source === 'builtin', 'builtin source after rollback')
}

function testCloneBuiltinSameRuleId(): void {
  resetCache()
  const doc = builtinRiskRuleToConfig('fast_confirmation_in_risky_flow')
  doc.version = 1
  doc.status = 'draft'
  doc.title = 'Clone'
  doc.description = 'Clone desc'
  doc.scoreDelta = 99
  upsertRiskRuleDocument(doc)
  publishRuleInCache(doc)
  const rule = getRuntimeRiskRules().find((r) => r.id === 'fast_confirmation_in_risky_flow')
  assert(rule?.delta === 99, 'clone/override same ruleId publishes to runtime')
  assert(resolveRuntimeRuleFlagId(doc) === 'fast_confirmation_in_risky_flow', 'runtime id matches ruleId')
}

function testImportRoundtrip(): void {
  resetCache()
  const doc = builtinRiskRuleToConfig('recovery_phrase_entered')
  doc.status = 'draft'
  doc.title = 'RT'
  doc.description = 'RT desc'

  const bundle = buildExportBundle([doc])
  const parsed = parseRiskRuleConfigImportPayload(bundle)
  assert(parsed?.length === 1, 'bundle parse')
  assert(validateImportDocuments(parsed!).valid, 'import validation')

  importRiskRuleDocuments(parsed!)
  const stored = getAuthoredDocument(doc.ruleId, doc.version)
  assert(stored?.title === 'RT', 'import persisted')

  assert(parseRiskRuleConfigImportPayload({ corrupt: true }) === null, 'corrupt payload rejected')
  assert(parseRiskRuleConfigImportPayload([{ ruleId: 'x' }]) === null, 'incomplete array rejected')
}

function testPreviewRuntimeConsistency(): void {
  const doc = builtinRiskRuleToConfig('ignored_warning')
  doc.enabled = true
  const preview = buildRiskRulePreview(doc)
  const runtime = riskRuleConfigToRuntime(doc)
  assert(preview.runtimeRuleId === 'ignored_warning', 'preview runtime id')
  assert(preview.scoreContribution === doc.scoreDelta, 'preview score when enabled')
  assert(runtime.delta === doc.scoreDelta, 'runtime delta matches config')

  doc.enabled = false
  const offPreview = buildRiskRulePreview(doc)
  assert(offPreview.scoreContribution === 0, 'disabled preview score zero')
}

function testNormalizeUnknownCondition(): void {
  const doc = builtinRiskRuleToConfig('ignored_warning')
  const broken = {
    ...doc,
    condition: { type: 'unknown_type' as never, params: {} },
  }
  const normalized = normalizeRiskRuleConfig(broken)
  assert(normalized.condition.type === 'ignored_warning', 'unknown condition type normalized')
  assert(
    normalized.condition.params?.dismissTypes !== undefined,
    'default params merged for preview/runtime',
  )
}

function testBuiltinCountStable(): void {
  resetCache()
  assert(
    getRuntimeRiskRules().length === BUILTIN_RISK_RULE_DEFINITIONS.length,
    'no override: runtime rule count equals builtin',
  )
}

function main(): void {
  testValidation()
  testRegistryOverrideAndRollback()
  testCloneBuiltinSameRuleId()
  testImportRoundtrip()
  testPreviewRuntimeConsistency()
  testNormalizeUnknownCondition()
  testBuiltinCountStable()
  console.log('Phase 3C.3 stabilization: all checks passed.')
}

main()
