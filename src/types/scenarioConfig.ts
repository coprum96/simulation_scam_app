import type { ProfileId } from './profile'
import type { RiskLevel } from './risk'
import type { SimulatorType } from './scenario'

import type { AuthoringDocumentLifecycle, AuthoringReviewState } from './authoringLifecycle'

export const SCENARIO_CONFIG_SCHEMA_VERSION = 1

export type ScenarioConfigStatus = AuthoringReviewState

export type ScenarioConfigActionKind = 'primary' | 'secondary' | 'danger'

export type ScenarioConfigAction = {
  actionId: string
  labelRef: string
  kind: ScenarioConfigActionKind
}

export type ScenarioConfigStep = {
  stepId: string
  screenId: string
  title: string
  bodyRef: string
  actions: ScenarioConfigAction[]
  /** actionId → next stepId; empty string = linear next in steps list */
  nextByAction: Record<string, string>
}

export type ScenarioConfigMetadata = {
  title: string
  description: string
  simulatorType: SimulatorType
  riskLevel: RiskLevel
  expectedRiskFlags: string[]
  targetProfileIds: ProfileId[]
  warningsEnabled: boolean
  warningKeys: string[]
}

/** Versioned scenario definition (authoring data, not UI code). */
export type ScenarioConfigDocument = {
  schemaVersion: typeof SCENARIO_CONFIG_SCHEMA_VERSION
  scenarioId: string
  version: number
  status: ScenarioConfigStatus
  metadata: ScenarioConfigMetadata
  steps: ScenarioConfigStep[]
  createdAt: string
  updatedAt: string
  lifecycle?: AuthoringDocumentLifecycle
}

export type ScenarioConfigExportBundle = {
  exportSchema: 'scenario_config_bundle'
  exportSchemaVersion: 1
  exportedAt: string
  documents: ScenarioConfigDocument[]
}

export type ScenarioConfigValidationSeverity = 'blocking' | 'warning'

export type ScenarioConfigValidationMessageKey =
  | 'scenarioIdRequired'
  | 'scenarioIdFormat'
  | 'scenarioIdBuiltinConflict'
  | 'scenarioIdDuplicate'
  | 'titleRequired'
  | 'descriptionRequired'
  | 'stepsRequired'
  | 'stepIdDuplicate'
  | 'stepIdInvalid'
  | 'screenIdInvalid'
  | 'actionIdDuplicate'
  | 'actionIdRequired'
  | 'nextStepInvalid'
  | 'versionInvalid'
  | 'expectedFlagsRequired'
  | 'profilesRequired'
  | 'noResultStep'
  | 'unreachableStep'
  | 'warningsEnabledNoWarningStep'
  | 'emptyBodyRef'
  | 'screenIdMismatchHint'
  | 'branchOverridesLinear'
  | 'allStepsUsedCannotDuplicate'

export type ScenarioConfigValidationIssue = {
  path: string
  messageKey: ScenarioConfigValidationMessageKey
  severity: ScenarioConfigValidationSeverity
}
