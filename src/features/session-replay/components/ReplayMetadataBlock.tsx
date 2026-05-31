import { getProfileById } from '../../../data/profiles'
import { getScenarioById } from '../../../data/scenarios'
import { simulatorLabel } from '../../../config'
import { ru } from '../../../content/ru'
import type { SessionRecord } from '../../../types/contracts'
import { Card } from '../../../components/ui/Card'
import {
  formatReplayTimestamp,
  replayOutcomeLabel,
  replayStatusLabel,
} from '../replayFormatters'

type ReplayMetadataBlockProps = {
  record: SessionRecord
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900 break-words">{value}</dd>
    </div>
  )
}

export function ReplayMetadataBlock({ record }: ReplayMetadataBlockProps) {
  const scenario = getScenarioById(record.scenarioId)
  const profile = getProfileById(record.profileId)

  return (
    <Card>
      <h2 className="mb-3 text-base font-semibold text-slate-900">{ru.replay.metadataTitle}</h2>
      <dl className="space-y-2">
        <MetaRow label={ru.replay.sessionId} value={record.sessionId} />
        <MetaRow label={ru.replay.scenario} value={scenario?.title ?? record.scenarioId} />
        <MetaRow label={ru.replay.profile} value={profile?.name ?? record.profileId} />
        <MetaRow label={ru.replay.simulator} value={simulatorLabel(record.simulatorType)} />
        <MetaRow label={ru.replay.status} value={replayStatusLabel(record.status)} />
        <MetaRow label={ru.replay.outcome} value={replayOutcomeLabel(record.outcome)} />
        <MetaRow label={ru.replay.startedAt} value={formatReplayTimestamp(record.startedAt)} />
        <MetaRow
          label={ru.replay.endedAt}
          value={record.endedAt ? formatReplayTimestamp(record.endedAt) : ru.replay.outcomeNone}
        />
      </dl>
    </Card>
  )
}
