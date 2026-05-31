import type { Session } from '../../types/contracts'
import { sessionRiskLevel, sessionRiskScore } from './dashboardFilters'

export type DashboardKpis = {
  totalEnded: number
  averageRiskScore: number
  highRiskCount: number
  abandonedCount: number
}

export function computeDashboardKpis(sessions: Session[]): DashboardKpis {
  if (sessions.length === 0) {
    return {
      totalEnded: 0,
      averageRiskScore: 0,
      highRiskCount: 0,
      abandonedCount: 0,
    }
  }

  const scores = sessions.map(sessionRiskScore)
  const sum = scores.reduce((acc, n) => acc + n, 0)

  return {
    totalEnded: sessions.length,
    averageRiskScore: Math.round(sum / scores.length),
    highRiskCount: sessions.filter((s) => sessionRiskLevel(s) === 'high').length,
    abandonedCount: sessions.filter((s) => s.record.outcome === 'abandoned').length,
  }
}
