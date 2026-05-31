export const WORKFLOW_STORAGE_SCHEMA_VERSION = 1 as const

export type InvestigationMarker = 'pending' | 'reviewed' | 'flagged'

export type WorkflowStepId = 'simulate' | 'analytics' | 'investigate' | 'conclude'

export type WorkflowPresetId =
  | 'high_risk'
  | 'abandoned_risky'
  | 'warning_dismiss'
  | 'wallet_suspicious'

export type WorkflowStorageV1 = {
  schemaVersion: typeof WORKFLOW_STORAGE_SCHEMA_VERSION
  markers: Record<string, InvestigationMarker>
  notes: Record<string, string>
  visited: {
    analytics: boolean
    explainSessionIds: string[]
    replaySessionIds: string[]
    compare: boolean
    export: boolean
  }
  workflowIntroDismissed: boolean
}

export type WorkflowStepState = {
  id: WorkflowStepId
  done: boolean
  current: boolean
}

export type WorkflowProgress = {
  steps: WorkflowStepState[]
  currentStepId: WorkflowStepId
  hasAnySessions: boolean
}
