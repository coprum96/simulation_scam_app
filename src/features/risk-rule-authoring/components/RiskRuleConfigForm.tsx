import { RISK_RULE_CONDITION_TYPES } from '../../../types/riskRuleConfig'
import type { RiskRuleConfigDocument } from '../../../types/riskRuleConfig'
import { ru } from '../../../content/ru'
import {
  AuthoringSelect,
  AuthoringTextArea,
  AuthoringTextField,
} from '../../scenario-authoring/components/AuthoringFormField'

type Props = {
  document: RiskRuleConfigDocument
  readOnly: boolean
  onChange: (doc: RiskRuleConfigDocument) => void
}

export function RiskRuleConfigForm({ document, readOnly, onChange }: Props) {
  const patch = (partial: Partial<RiskRuleConfigDocument>) => {
    onChange({ ...document, ...partial })
  }

  const patchApplicability = (partial: Partial<RiskRuleConfigDocument['applicability']>) => {
    onChange({
      ...document,
      applicability: { ...document.applicability, ...partial },
    })
  }

  const patchCondition = (partial: Partial<RiskRuleConfigDocument['condition']>) => {
    onChange({
      ...document,
      condition: { ...document.condition, ...partial },
    })
  }

  const patchParams = (partial: NonNullable<RiskRuleConfigDocument['condition']['params']>) => {
    onChange({
      ...document,
      condition: {
        ...document.condition,
        params: { ...document.condition.params, ...partial },
      },
    })
  }

  const flagsText = document.emittedRiskFlags.join('\n')

  return (
    <div>
      <AuthoringTextField
        label={ru.riskRuleAuthoring.fieldRuleId}
        hint={ru.riskRuleAuthoring.ruleIdHint}
        value={document.ruleId}
        disabled={readOnly}
        onChange={(e) => patch({ ruleId: e.target.value.trim() })}
      />
      <AuthoringTextField
        label={ru.riskRuleAuthoring.fieldTitle}
        value={document.title}
        disabled={readOnly}
        onChange={(e) => patch({ title: e.target.value })}
      />
      <AuthoringTextArea
        label={ru.riskRuleAuthoring.fieldDescription}
        value={document.description}
        disabled={readOnly}
        onChange={(e) => patch({ description: e.target.value })}
      />
      <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={document.enabled}
          disabled={readOnly}
          onChange={(e) => patch({ enabled: e.target.checked })}
          className="size-4 rounded border-slate-300"
        />
        {ru.riskRuleAuthoring.fieldEnabled}
      </label>

      <h3 className="mb-2 text-sm font-semibold text-slate-800">
        {ru.riskRuleAuthoring.applicabilityTitle}
      </h3>
      <AuthoringSelect
        label={ru.riskRuleAuthoring.fieldSimulatorScope}
        value={document.applicability.simulatorType}
        disabled={readOnly}
        onChange={(e) =>
          patchApplicability({
            simulatorType: e.target.value as RiskRuleConfigDocument['applicability']['simulatorType'],
          })
        }
      >
        <option value="all">{ru.riskRuleAuthoring.simulatorScopeAll}</option>
        <option value="banking">{ru.hub.simulatorBanking}</option>
        <option value="wallet">{ru.hub.simulatorWallet}</option>
      </AuthoringSelect>
      <AuthoringSelect
        label={ru.riskRuleAuthoring.fieldCatalogRiskScope}
        value={document.applicability.catalogRiskScope}
        disabled={readOnly}
        onChange={(e) =>
          patchApplicability({
            catalogRiskScope: e.target
              .value as RiskRuleConfigDocument['applicability']['catalogRiskScope'],
          })
        }
      >
        <option value="any">{ru.riskRuleAuthoring.catalogScopeAny}</option>
        <option value="elevated">{ru.riskRuleAuthoring.catalogScopeElevated}</option>
        <option value="low">{ru.riskLevel.low}</option>
        <option value="medium">{ru.riskLevel.medium}</option>
        <option value="high">{ru.riskLevel.high}</option>
      </AuthoringSelect>
      <AuthoringTextArea
        label={ru.riskRuleAuthoring.fieldScenarioIds}
        hint={ru.riskRuleAuthoring.listFieldHint}
        rows={2}
        value={(document.applicability.scenarioIds ?? []).join('\n')}
        disabled={readOnly}
        onChange={(e) =>
          patchApplicability({
            scenarioIds: e.target.value
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
          })
        }
      />

      <h3 className="mb-2 mt-4 text-sm font-semibold text-slate-800">
        {ru.riskRuleAuthoring.conditionTitle}
      </h3>
      <AuthoringSelect
        label={ru.riskRuleAuthoring.fieldConditionType}
        value={document.condition.type}
        disabled={readOnly}
        onChange={(e) =>
          patchCondition({
            type: e.target.value as RiskRuleConfigDocument['condition']['type'],
            params: {},
          })
        }
      >
        {RISK_RULE_CONDITION_TYPES.map((type) => (
          <option key={type} value={type}>
            {ru.riskRuleAuthoring.conditionTypeLabels[type]}
          </option>
        ))}
      </AuthoringSelect>

      {(document.condition.type === 'fast_confirmation_in_risky_flow' ||
        document.condition.type === 'repeated_field_edits' ||
        document.condition.type === 'multiple_back_navigation_loops' ||
        document.condition.type === 'new_recipient_in_risky_scenario' ||
        document.condition.type === 'malicious_approval_signed' ||
        document.condition.type === 'recovery_phrase_entered' ||
        document.condition.type === 'signature_rejected_after_warning' ||
        document.condition.type === 'ignored_warning' ||
        document.condition.type === 'user_stopped_after_warning') && (
        <p className="mb-2 text-xs text-slate-500">{ru.riskRuleAuthoring.conditionParamsHint}</p>
      )}

      {document.condition.type === 'fast_confirmation_in_risky_flow' ? (
        <AuthoringTextField
          label={ru.riskRuleAuthoring.fieldMaxConfirmationMs}
          type="number"
          value={String(document.condition.params?.maxConfirmationDelayMs ?? '')}
          disabled={readOnly}
          onChange={(e) =>
            patchParams({ maxConfirmationDelayMs: Number(e.target.value) || undefined })
          }
        />
      ) : null}

      {document.condition.type === 'repeated_field_edits' ? (
        <AuthoringTextField
          label={ru.riskRuleAuthoring.fieldMinFieldEdits}
          type="number"
          value={String(document.condition.params?.minFieldEditCount ?? '')}
          disabled={readOnly}
          onChange={(e) =>
            patchParams({ minFieldEditCount: Number(e.target.value) || undefined })
          }
        />
      ) : null}

      {document.condition.type === 'multiple_back_navigation_loops' ? (
        <AuthoringTextField
          label={ru.riskRuleAuthoring.fieldMinBackNav}
          type="number"
          value={String(document.condition.params?.minBackNavigationCount ?? '')}
          disabled={readOnly}
          onChange={(e) =>
            patchParams({ minBackNavigationCount: Number(e.target.value) || undefined })
          }
        />
      ) : null}

      {document.condition.type === 'new_recipient_in_risky_scenario' ? (
        <AuthoringTextField
          label={ru.riskRuleAuthoring.fieldScreenId}
          value={document.condition.params?.screenId ?? ''}
          disabled={readOnly}
          onChange={(e) => patchParams({ screenId: e.target.value || undefined })}
        />
      ) : null}

      {document.condition.type === 'malicious_approval_signed' ? (
        <AuthoringTextField
          label={ru.riskRuleAuthoring.fieldScenarioIdParam}
          value={document.condition.params?.scenarioId ?? ''}
          disabled={readOnly}
          onChange={(e) => patchParams({ scenarioId: e.target.value || undefined })}
        />
      ) : null}

      {document.condition.type === 'recovery_phrase_entered' ? (
        <AuthoringTextField
          label={ru.riskRuleAuthoring.fieldEventType}
          value={document.condition.params?.eventType ?? ''}
          disabled={readOnly}
          onChange={(e) =>
            patchParams({
              eventType: e.target.value as NonNullable<
                typeof document.condition.params
              >['eventType'],
            })
          }
        />
      ) : null}

      {document.condition.type === 'signature_rejected_after_warning' ? (
        <AuthoringTextField
          label={ru.riskRuleAuthoring.fieldAfterEventType}
          value={document.condition.params?.afterEventType ?? ''}
          disabled={readOnly}
          onChange={(e) =>
            patchParams({
              afterEventType: e.target.value as NonNullable<
                typeof document.condition.params
              >['afterEventType'],
            })
          }
        />
      ) : null}

      {(document.condition.type === 'ignored_warning' ||
        document.condition.type === 'user_stopped_after_warning') && (
        <AuthoringTextArea
          label={ru.riskRuleAuthoring.fieldDismissTypes}
          hint={ru.riskRuleAuthoring.listFieldHint}
          rows={2}
          value={(document.condition.params?.dismissTypes ?? []).join('\n')}
          disabled={readOnly}
          onChange={(e) =>
            patchParams({
              dismissTypes: e.target.value
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      )}

      <h3 className="mb-2 mt-4 text-sm font-semibold text-slate-800">
        {ru.riskRuleAuthoring.impactTitle}
      </h3>
      <AuthoringTextField
        label={ru.riskRuleAuthoring.fieldScoreDelta}
        type="number"
        value={String(document.scoreDelta)}
        disabled={readOnly}
        onChange={(e) => patch({ scoreDelta: Number(e.target.value) })}
      />
      <AuthoringTextArea
        label={ru.riskRuleAuthoring.fieldEmittedFlags}
        hint={ru.riskRuleAuthoring.emittedFlagsHint}
        rows={3}
        value={flagsText}
        disabled={readOnly}
        onChange={(e) => {
          const flags = e.target.value
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean) as RiskRuleConfigDocument['emittedRiskFlags']
          patch({ emittedRiskFlags: flags })
        }}
      />
      <AuthoringSelect
        label={ru.riskRuleAuthoring.fieldLevelHint}
        value={document.levelHint}
        disabled={readOnly}
        onChange={(e) =>
          patch({ levelHint: e.target.value as RiskRuleConfigDocument['levelHint'] })
        }
      >
        <option value="auto">{ru.riskRuleAuthoring.levelHintAutoOption}</option>
        <option value="low">{ru.riskLevel.low}</option>
        <option value="medium">{ru.riskLevel.medium}</option>
        <option value="high">{ru.riskLevel.high}</option>
      </AuthoringSelect>
    </div>
  )
}
