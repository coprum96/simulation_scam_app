import { mockProfiles } from '../../../data/profiles'
import { RISK_LEVELS, SIMULATOR_TYPES } from '../../../config'
import { ru } from '../../../content/ru'
import type { ScenarioConfigDocument } from '../../../types/scenarioConfig'
import { AuthoringSelect, AuthoringTextArea, AuthoringTextField } from './AuthoringFormField'

type ScenarioConfigMetadataFormProps = {
  document: ScenarioConfigDocument
  onChange: (document: ScenarioConfigDocument) => void
  idEditable?: boolean
}

function linesToList(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function listToLines(values: string[]): string {
  return values.join('\n')
}

export function ScenarioConfigMetadataForm({
  document,
  onChange,
  idEditable = true,
}: ScenarioConfigMetadataFormProps) {
  const updateMetadata = (patch: Partial<ScenarioConfigDocument['metadata']>) => {
    onChange({
      ...document,
      metadata: { ...document.metadata, ...patch },
    })
  }

  const toggleProfile = (profileId: (typeof mockProfiles)[number]['id']) => {
    const current = document.metadata.targetProfileIds
    const next = current.includes(profileId)
      ? current.filter((id) => id !== profileId)
      : [...current, profileId]
    updateMetadata({ targetProfileIds: next })
  }

  return (
    <div className="space-y-1">
      <AuthoringTextField
        label={ru.authoring.fieldScenarioId}
        value={document.scenarioId}
        disabled={!idEditable}
        onChange={(e) => onChange({ ...document, scenarioId: e.target.value.trim() })}
      />
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <AuthoringTextField
          label={ru.authoring.fieldVersion}
          value={String(document.version)}
          disabled
          readOnly
        />
        <AuthoringSelect
          label={ru.authoring.fieldStatus}
          value={document.status}
          disabled
          onChange={() => undefined}
        >
          <option value="draft">{ru.authoring.statusLabels.draft}</option>
          <option value="in_review">{ru.authoring.statusLabels.in_review}</option>
          <option value="published">{ru.authoring.statusLabels.published}</option>
        </AuthoringSelect>
      </div>
      <AuthoringTextField
        label={ru.authoring.fieldTitle}
        value={document.metadata.title}
        onChange={(e) => updateMetadata({ title: e.target.value })}
      />
      <AuthoringTextArea
        label={ru.authoring.fieldDescription}
        value={document.metadata.description}
        onChange={(e) => updateMetadata({ description: e.target.value })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <AuthoringSelect
          label={ru.authoring.fieldSimulatorType}
          value={document.metadata.simulatorType}
          onChange={(e) =>
            updateMetadata({
              simulatorType: e.target.value as ScenarioConfigDocument['metadata']['simulatorType'],
            })
          }
        >
          {SIMULATOR_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </AuthoringSelect>
        <AuthoringSelect
          label={ru.authoring.fieldRiskLevel}
          value={document.metadata.riskLevel}
          onChange={(e) =>
            updateMetadata({
              riskLevel: e.target.value as ScenarioConfigDocument['metadata']['riskLevel'],
            })
          }
        >
          {RISK_LEVELS.map((level) => (
            <option key={level} value={level}>
              {ru.riskLevel[level]}
            </option>
          ))}
        </AuthoringSelect>
      </div>
      <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="size-4 rounded border-slate-300"
          checked={document.metadata.warningsEnabled}
          onChange={(e) => updateMetadata({ warningsEnabled: e.target.checked })}
        />
        {ru.authoring.fieldWarningsEnabled}
      </label>
      <AuthoringTextArea
        label={ru.authoring.fieldExpectedRiskFlags}
        hint={ru.authoring.listFieldHint}
        value={listToLines(document.metadata.expectedRiskFlags)}
        onChange={(e) => updateMetadata({ expectedRiskFlags: linesToList(e.target.value) })}
      />
      <AuthoringTextArea
        label={ru.authoring.fieldWarningKeys}
        hint={ru.authoring.listFieldHint}
        value={listToLines(document.metadata.warningKeys)}
        onChange={(e) => updateMetadata({ warningKeys: linesToList(e.target.value) })}
      />
      <div className="mb-3">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {ru.authoring.fieldTargetProfiles}
        </span>
        <div className="flex flex-wrap gap-2">
          {mockProfiles.map((profile) => (
            <label
              key={profile.id}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={document.metadata.targetProfileIds.includes(profile.id)}
                onChange={() => toggleProfile(profile.id)}
              />
              {profile.name}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
