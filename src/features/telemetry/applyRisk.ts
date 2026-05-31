import type { RiskAssessment, SessionRiskReport } from '../../types/risk'
import type { Session, SessionRecord, SessionSummary } from '../../types/contracts'

export function applyRiskToSummary(
  summary: SessionSummary,
  assessment: RiskAssessment,
): SessionSummary {
  return {
    ...summary,
    riskScore: assessment.riskScore,
    riskLevel: assessment.riskLevel,
    riskFlags: [...assessment.riskFlags],
  }
}

export function applyRiskToRecord(
  record: SessionRecord,
  assessment: RiskAssessment | null,
): SessionRecord {
  if (!assessment) {
    return { ...record, riskScore: null, riskLevel: null, riskFlags: null }
  }
  return {
    ...record,
    riskScore: assessment.riskScore,
    riskLevel: assessment.riskLevel,
    riskFlags: [...assessment.riskFlags],
  }
}

export function applyRiskToSession(
  session: Session,
  assessment: RiskAssessment,
  riskReport: SessionRiskReport,
): Session {
  return {
    record: applyRiskToRecord(session.record, assessment),
    events: session.events,
    summary: applyRiskToSummary(session.summary, assessment),
    riskReport,
  }
}
