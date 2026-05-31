import {
  FAST_CONFIRMATION_MS,
  FIELD_EDIT_COUNT_THRESHOLD,
  NAVIGATION_LOOP_BACK_COUNT,
  RISK_BANKING_STEP_IDS,
  RISK_SCENARIO_IDS,
} from '../../config'
import type { RiskRuleApplicability, RiskRuleCondition } from '../../types/riskRuleConfig'
import type { RiskLevel } from '../../types/risk'
import type { Scenario } from '../../types/scenario'
import {
  catalogRiskIsElevated,
  hasDismissType,
  hasEventAfterWarning,
  userConfirmedAction,
  visitedScreen,
} from './riskRuleHelpers'
import type { RiskRuleContext } from './riskRuleTypes'

function catalogRiskMatchesScope(
  scenario: Scenario,
  scope: RiskRuleApplicability['catalogRiskScope'],
): boolean {
  if (scope === 'any') return true
  if (scope === 'elevated') return catalogRiskIsElevated(scenario)
  return scenario.riskLevel === scope
}

export function matchesRiskRuleApplicability(
  applicability: RiskRuleApplicability,
  ctx: RiskRuleContext,
): boolean {
  const { simulatorType, catalogRiskScope, scenarioIds } = applicability
  if (simulatorType !== 'all' && ctx.scenario.simulatorType !== simulatorType) {
    return false
  }
  if (!catalogRiskMatchesScope(ctx.scenario, catalogRiskScope)) {
    return false
  }
  if (scenarioIds && scenarioIds.length > 0 && !scenarioIds.includes(ctx.scenario.id)) {
    return false
  }
  return true
}

function hasAnyDismissType(events: RiskRuleContext['events'], types: string[]): boolean {
  return types.some((t) => hasDismissType(events, t))
}

export function evaluateDeclarativeRiskCondition(
  condition: RiskRuleCondition,
  ctx: RiskRuleContext,
): boolean {
  const params = condition.params ?? {}

  switch (condition.type) {
    case 'ignored_warning': {
      const dismissTypes =
        params.dismissTypes && params.dismissTypes.length > 0
          ? params.dismissTypes
          : ['continued', 'bypassed']
      return (
        ctx.summary.warningsIgnored > 0 || hasAnyDismissType(ctx.events, dismissTypes)
      )
    }
    case 'warning_seen_then_cancelled':
      return (
        ctx.summary.warningsSeen > 0 &&
        ctx.record.outcome === 'stopped' &&
        (ctx.summary.eventCounts.cancel > 0 || hasDismissType(ctx.events, 'cancelled'))
      )
    case 'fast_confirmation_in_risky_flow': {
      const maxDelay = params.maxConfirmationDelayMs ?? FAST_CONFIRMATION_MS
      const needsElevated = params.requiresElevatedCatalogRisk !== false
      const riskyOk = !needsElevated || catalogRiskIsElevated(ctx.scenario)
      return (
        riskyOk &&
        ctx.summary.confirmationDelayMs !== null &&
        ctx.summary.confirmationDelayMs < maxDelay &&
        ctx.events.some(
          (e) => e.eventType === 'confirm' || e.eventType === 'signature_approve',
        )
      )
    }
    case 'new_recipient_in_risky_scenario': {
      const screenId = params.screenId ?? RISK_BANKING_STEP_IDS.newRecipient
      const needsElevated = params.requiresElevatedCatalogRisk !== false
      const riskyOk = !needsElevated || catalogRiskIsElevated(ctx.scenario)
      return (
        riskyOk &&
        ctx.scenario.steps.includes(screenId) &&
        visitedScreen(ctx.events, screenId)
      )
    }
    case 'repeated_field_edits': {
      const min = params.minFieldEditCount ?? FIELD_EDIT_COUNT_THRESHOLD
      return ctx.summary.fieldEditCount >= min
    }
    case 'multiple_back_navigation_loops': {
      const min = params.minBackNavigationCount ?? NAVIGATION_LOOP_BACK_COUNT
      return ctx.summary.backNavigationCount >= min
    }
    case 'recovery_phrase_entered': {
      const eventType = params.eventType ?? 'recovery_input'
      const key = eventType as keyof typeof ctx.summary.eventCounts
      return (ctx.summary.eventCounts[key] ?? 0) > 0
    }
    case 'malicious_approval_signed': {
      const scenarioId = params.scenarioId ?? RISK_SCENARIO_IDS.walletMaliciousApproval
      return (
        ctx.scenario.id === scenarioId && userConfirmedAction(ctx.events, ctx.record)
      )
    }
    case 'signature_rejected_after_warning': {
      const afterType = params.afterEventType ?? 'signature_reject'
      return hasEventAfterWarning(ctx.events, (e) => e.eventType === afterType)
    }
    case 'user_stopped_after_warning': {
      const dismissTypes =
        params.dismissTypes && params.dismissTypes.length > 0
          ? params.dismissTypes
          : ['cancelled']
      return (
        ctx.summary.warningsSeen > 0 &&
        (hasAnyDismissType(ctx.events, dismissTypes) ||
          (ctx.record.outcome === 'stopped' && ctx.summary.eventCounts.cancel > 0))
      )
    }
    default:
      return false
  }
}

export function levelHintFromDelta(delta: number): RiskLevel {
  const abs = Math.abs(delta)
  if (abs >= 20) return 'high'
  if (abs >= 10) return 'medium'
  return 'low'
}
