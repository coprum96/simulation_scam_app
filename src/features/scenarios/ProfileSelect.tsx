import { mockProfiles } from '../../data/profiles'
import { traitLevelLabel, reactionSpeedLabel } from '../../config'
import { useSessionStore } from '../telemetry/sessionStore'
import { ru } from '../../content/ru'
import type { ProfileId } from '../../types/profile'

export function ProfileSelect() {
  const selectedProfileId = useSessionStore((s) => s.selectedProfileId)
  const setSelectedProfileId = useSessionStore((s) => s.setSelectedProfileId)
  const profile = mockProfiles.find((p) => p.id === selectedProfileId)

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700" htmlFor="profile-select">
        {ru.hub.profileLabel}
      </label>
      <select
        id="profile-select"
        value={selectedProfileId}
        onChange={(e) => setSelectedProfileId(e.target.value as ProfileId)}
        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
      >
        {mockProfiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — {p.description}
          </option>
        ))}
      </select>

      {profile ? (
        <dl className="grid grid-cols-1 gap-2 rounded-xl bg-teal-50/40 p-3 text-xs text-slate-600 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">{ru.traits.digitalConfidence}</dt>
            <dd>{traitLevelLabel(profile.digitalConfidence)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">{ru.traits.fraudAwareness}</dt>
            <dd>{traitLevelLabel(profile.fraudAwareness)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">{ru.traits.readingDepth}</dt>
            <dd>{traitLevelLabel(profile.readingDepth)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">{ru.traits.reactionSpeed}</dt>
            <dd>{reactionSpeedLabel(profile.reactionSpeed)}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  )
}
