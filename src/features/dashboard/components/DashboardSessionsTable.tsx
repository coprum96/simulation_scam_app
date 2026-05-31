import { Link } from 'react-router-dom'
import { getProfileById } from '../../../data/profiles'
import { getScenarioById } from '../../../data/scenarios'
import { riskLevelLabel, sessionReplayPath, simulatorLabel } from '../../../config'
import { ru } from '../../../content/ru'
import type { Session } from '../../../types/contracts'
import { Card } from '../../../components/ui/Card'
import { formatReplayTimestamp, replayOutcomeLabel } from '../../session-replay/replayFormatters'
import { sessionRiskLevel, sessionRiskScore } from '../dashboardFilters'

type DashboardSessionsTableProps = {
  sessions: Session[]
}

export function DashboardSessionsTable({ sessions }: DashboardSessionsTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-slate-900">{ru.dashboard.tableTitle}</h2>
      </div>
      {sessions.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-600">{ru.dashboard.noSessions}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <th className="px-4 py-2.5 font-medium">{ru.dashboard.colSessionId}</th>
                <th className="px-4 py-2.5 font-medium">{ru.dashboard.colScenario}</th>
                <th className="px-4 py-2.5 font-medium">{ru.dashboard.colProfile}</th>
                <th className="px-4 py-2.5 font-medium">{ru.dashboard.colSimulator}</th>
                <th className="px-4 py-2.5 font-medium">{ru.dashboard.colOutcome}</th>
                <th className="px-4 py-2.5 font-medium">{ru.dashboard.colRiskScore}</th>
                <th className="px-4 py-2.5 font-medium">{ru.dashboard.colRiskLevel}</th>
                <th className="px-4 py-2.5 font-medium">{ru.dashboard.colStartedAt}</th>
                <th className="px-4 py-2.5 font-medium">{ru.dashboard.colEndedAt}</th>
                <th className="px-4 py-2.5 font-medium">{ru.dashboard.colReplay}</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const { record } = session
                const scenario = getScenarioById(record.scenarioId)
                const profile = getProfileById(record.profileId)
                const score = sessionRiskScore(session)
                const level = sessionRiskLevel(session)

                return (
                  <tr key={record.sessionId} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-600">
                      {record.sessionId}
                    </td>
                    <td className="px-4 py-2.5 text-slate-900">
                      {scenario?.title ?? record.scenarioId}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {profile?.name ?? record.profileId}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {simulatorLabel(record.simulatorType)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {replayOutcomeLabel(record.outcome)}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{score}</td>
                    <td className="px-4 py-2.5 text-slate-700">{riskLevelLabel(level)}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">
                      {formatReplayTimestamp(record.startedAt)}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">
                      {record.endedAt
                        ? formatReplayTimestamp(record.endedAt)
                        : ru.replay.outcomeNone}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        to={sessionReplayPath(record.sessionId)}
                        className="inline-flex min-h-11 items-center font-medium text-slate-700 underline hover:text-slate-900"
                      >
                        {ru.dashboard.openReplay}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
