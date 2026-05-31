import type { ScenarioId } from '../../types/scenario'

export function isRecoveryPhraseCommitted(phrase: string): boolean {
  return phrase.trim().split(/\s+/).filter(Boolean).length >= 3
}

export function shouldShowFakeSecurityAlert(scenarioId: ScenarioId): boolean {
  return scenarioId === 'wallet_malicious_approval'
}
