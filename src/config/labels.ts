import { ru } from '../content/ru'
import type { RiskLevel, SimulatorType } from '../types/scenario'
import type { ReactionSpeed, TraitLevel } from '../types/profile'
import type { RiskLevelFilter, SimulatorTypeFilter } from './simulator'
import { FILTER_ALL } from './filters'

export function riskLevelLabel(level: RiskLevel): string {
  return ru.riskLevel[level]
}

export function simulatorLabel(type: SimulatorType): string {
  return type === 'banking' ? ru.hub.simulatorBanking : ru.hub.simulatorWallet
}

export function simulatorFilterLabel(value: SimulatorTypeFilter): string {
  if (value === FILTER_ALL) return ru.hub.filterAll
  return simulatorLabel(value)
}

export function riskFilterLabel(value: RiskLevelFilter): string {
  if (value === FILTER_ALL) return ru.hub.filterAll
  return riskLevelLabel(value)
}

export function traitLevelLabel(level: TraitLevel): string {
  return ru.traitLevel[level]
}

export function reactionSpeedLabel(speed: ReactionSpeed): string {
  return ru.reactionSpeed[speed]
}

export function riskLevelBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'bg-emerald-100 text-emerald-800'
    case 'medium':
      return 'bg-amber-100 text-amber-900'
    case 'high':
      return 'bg-rose-100 text-rose-900'
  }
}
