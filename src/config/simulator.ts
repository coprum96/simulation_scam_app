import type { RiskLevel, SimulatorType } from '../types/scenario'

export const SIMULATOR_TYPES = ['banking', 'wallet'] as const satisfies readonly SimulatorType[]

export const RISK_LEVELS = ['low', 'medium', 'high'] as const satisfies readonly RiskLevel[]

export type SimulatorTypeFilter = SimulatorType | 'all'
export type RiskLevelFilter = RiskLevel | 'all'
