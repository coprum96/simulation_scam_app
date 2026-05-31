import type { Session } from '../../../types/contracts'
import { isRecentEndedSession } from '../computeWorkflowProgress'
import { ResearchNextStepsPanel } from './ResearchNextStepsPanel'

type PostSimulationPanelProps = {
  session: Session | null
}

export function PostSimulationPanel({ session }: PostSimulationPanelProps) {
  if (!session || session.record.status !== 'ended') return null
  if (!isRecentEndedSession(session.record.endedAt)) return null

  return (
    <div className="mb-5 sm:mb-6">
      <ResearchNextStepsPanel variant="hub" session={session} />
    </div>
  )
}
