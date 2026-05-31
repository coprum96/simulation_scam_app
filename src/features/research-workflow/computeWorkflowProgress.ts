import type { WorkflowProgress, WorkflowStepId, WorkflowStepState } from './types'
import { loadWorkflowStorage } from './workflowStorage'

export function computeWorkflowProgress(hasAnySessions: boolean, pageStep?: WorkflowStepId): WorkflowProgress {
  const visited = loadWorkflowStorage().visited
  const investigated =
    visited.explainSessionIds.length > 0 || visited.replaySessionIds.length > 0
  const concluded = visited.compare || visited.export

  const simulateDone = hasAnySessions
  const analyticsDone = visited.analytics && hasAnySessions
  const investigateDone = investigated
  const concludeDone = concluded

  const doneMap: Record<WorkflowStepId, boolean> = {
    simulate: simulateDone,
    analytics: analyticsDone,
    investigate: investigateDone,
    conclude: concludeDone,
  }

  const order: WorkflowStepId[] = ['simulate', 'analytics', 'investigate', 'conclude']

  let currentStepId: WorkflowStepId = 'simulate'
  if (pageStep) {
    currentStepId = pageStep
  } else {
    for (const stepId of order) {
      if (!doneMap[stepId]) {
        currentStepId = stepId
        break
      }
      currentStepId = 'conclude'
    }
  }

  const steps: WorkflowStepState[] = order.map((id) => ({
    id,
    done: doneMap[id],
    current: id === currentStepId,
  }))

  return { steps, currentStepId, hasAnySessions }
}

export function isRecentEndedSession(endedAt: number | null | undefined, windowMs = 15 * 60_000): boolean {
  if (endedAt == null) return false
  return Date.now() - endedAt <= windowMs
}
