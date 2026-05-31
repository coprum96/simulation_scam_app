import type { FlowResultType, SessionOutcome } from '../../types/contracts'

/**
 * SessionOutcome из scenario_exit.meta (без safe/risky).
 */
export function sessionOutcomeFromExitMeta(meta?: Record<string, unknown>): SessionOutcome {
  const explicit = meta?.outcome
  if (explicit === 'completed' || explicit === 'stopped' || explicit === 'abandoned') {
    return explicit
  }

  const resultType = meta?.resultType as FlowResultType | undefined
  if (resultType === 'confirmed' || resultType === 'escalated') return 'completed'
  if (resultType === 'cancelled' || resultType === 'rejected') return 'stopped'

  const reason = meta?.reason
  if (
    reason === 'replaced_by_new_session' ||
    reason === 'back_to_hub' ||
    reason === 'user_exit'
  ) {
    return 'abandoned'
  }

  return 'stopped'
}

export function sessionOutcomeFromFlowResult(resultType: FlowResultType): SessionOutcome {
  if (resultType === 'confirmed' || resultType === 'escalated') return 'completed'
  return 'stopped'
}
