import { useMemo } from 'react'
import { computeWorkflowProgress } from './computeWorkflowProgress'
import type { WorkflowStepId } from './types'
import { useWorkflowStorageSnapshot } from './useInvestigationMarkers'

export function useResearchWorkflowProgress(
  hasAnySessions: boolean,
  pageStep?: WorkflowStepId,
) {
  const storage = useWorkflowStorageSnapshot()

  return useMemo(
    () => ({
      ...computeWorkflowProgress(hasAnySessions, pageStep),
      introDismissed: storage.workflowIntroDismissed,
    }),
    [hasAnySessions, pageStep, storage.workflowIntroDismissed, storage.visited],
  )
}
