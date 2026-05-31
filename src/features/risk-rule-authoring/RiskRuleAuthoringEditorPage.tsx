import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  riskRuleAuthoringEditPath,
  riskRuleAuthoringListPath,
  riskRuleAuthoringNewPath,
} from '../../config'
import { ru } from '../../content/ru'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { RiskRuleConfigForm } from './components/RiskRuleConfigForm'
import { RiskRuleConfigPreview } from './components/RiskRuleConfigPreview'
import { RiskRuleConfigValidationList } from './components/RiskRuleConfigValidationList'
import { downloadRiskRuleConfigDocument } from './downloadRiskRuleConfig'
import { isBuiltinReadOnlyView, resolveEditorDocument } from './resolveEditorDocument'
import { useRiskRuleAuthoringStore } from './riskRuleAuthoringStore'
import { normalizeRiskRuleConfig } from './normalizeRiskRuleConfig'
import { validateRiskRuleConfig } from './validateRiskRuleConfig'
import type { RiskRuleConfigDocument } from '../../types/riskRuleConfig'
import {
  AuthoringLifecycleIndicators,
  AuthoringReviewActionsPanel,
  AuthoringVersionHistoryPanel,
} from '../authoring-audit'
import { GovernanceAccessBanner } from '../governance/GovernanceAccessBanner'
import { useGovernanceAccess } from '../governance/useGovernanceAccess'

export function RiskRuleAuthoringEditorPage() {
  const { canEdit, canExport, canPublish } = useGovernanceAccess()
  const navigate = useNavigate()
  const { ruleId: routeRuleId } = useParams()
  const [searchParams] = useSearchParams()
  const isNew = routeRuleId === 'new'
  const cloneBuiltin = searchParams.get('clone') === 'true'
  const versionParam = Number(searchParams.get('version'))
  const idParam = searchParams.get('id')

  const refreshKey = useRiskRuleAuthoringStore((s) => s.refreshKey)
  const listVersions = useRiskRuleAuthoringStore((s) => s.listVersions)
  const saveDocument = useRiskRuleAuthoringStore((s) => s.saveDocument)
  const publishDocument = useRiskRuleAuthoringStore((s) => s.publishDocument)
  const submitForReview = useRiskRuleAuthoringStore((s) => s.submitForReview)
  const fetchAuditTrail = useRiskRuleAuthoringStore((s) => s.fetchAuditTrail)
  const createDraftFromVersion = useRiskRuleAuthoringStore((s) => s.createDraftFromVersion)

  const persistedRuleIdRef = useRef<string | null>(null)

  const resolvedDocument = useMemo(() => {
    void refreshKey
    return resolveEditorDocument({
      routeRuleId,
      isNew,
      cloneBuiltin,
      versionParam,
      idParam,
    })
  }, [refreshKey, routeRuleId, isNew, cloneBuiltin, versionParam, idParam])

  const [document, setDocument] = useState<RiskRuleConfigDocument>(resolvedDocument)
  const [showPreview, setShowPreview] = useState(true)
  const [publishError, setPublishError] = useState(false)

  const auditFetcher = useMemo(
    () => () => fetchAuditTrail(document.ruleId, document.version),
    [fetchAuditTrail, document.ruleId, document.version, refreshKey],
  )

  useEffect(() => {
    setDocument(resolvedDocument)
    setPublishError(false)
    if (!isNew && resolvedDocument.status !== 'draft' && !cloneBuiltin) {
      persistedRuleIdRef.current = resolvedDocument.ruleId
    } else if (isNew) {
      persistedRuleIdRef.current = null
    }
  }, [resolvedDocument, isNew, cloneBuiltin])

  const readOnlyBuiltin = isBuiltinReadOnlyView(routeRuleId, isNew, cloneBuiltin)
  const formLocked = readOnlyBuiltin || !canEdit
  const versions = !isNew && routeRuleId ? listVersions(routeRuleId) : []

  const validation = useMemo(
    () =>
      validateRiskRuleConfig(document, {
        forPublish: false,
        allowBuiltinOverride: true,
      }),
    [document],
  )

  const publishValidation = useMemo(
    () =>
      validateRiskRuleConfig(document, {
        forPublish: true,
        allowBuiltinOverride: true,
      }),
    [document],
  )

  const handleSaveDraft = async () => {
    if (!canEdit || !validation.canSaveDraft || readOnlyBuiltin) return
    const payload = normalizeRiskRuleConfig({
      ...document,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    })
    await saveDocument(payload, {
      previousRuleId: persistedRuleIdRef.current ?? undefined,
    })
    persistedRuleIdRef.current = payload.ruleId
    setDocument(payload)
    if (isNew || routeRuleId === 'new') {
      navigate(riskRuleAuthoringEditPath(payload.ruleId, { version: payload.version }), {
        replace: true,
      })
    }
  }

  const runPublish = async (note?: string) => {
    if (!canPublish || !publishValidation.canPublish || readOnlyBuiltin) {
      setPublishError(true)
      return
    }
    const draftPayload = normalizeRiskRuleConfig({
      ...document,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    })
    await saveDocument(draftPayload, {
      previousRuleId: persistedRuleIdRef.current ?? undefined,
    })
    persistedRuleIdRef.current = draftPayload.ruleId
    const published = await publishDocument(draftPayload.ruleId, draftPayload.version, { note })
    if (!published) {
      setPublishError(true)
      return
    }
    setDocument(published)
    setPublishError(false)
    if (isNew || routeRuleId === 'new') {
      navigate(
        riskRuleAuthoringEditPath(published.ruleId, { version: published.version }),
        { replace: true },
      )
    }
  }

  const runSubmitReview = async (note?: string) => {
    if (!canEdit || readOnlyBuiltin) return
    const draftPayload = normalizeRiskRuleConfig({
      ...document,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    })
    await saveDocument(draftPayload, {
      previousRuleId: persistedRuleIdRef.current ?? undefined,
    })
    persistedRuleIdRef.current = draftPayload.ruleId
    const updated = await submitForReview(draftPayload.ruleId, draftPayload.version, { note })
    if (updated) setDocument(updated)
  }

  const handleNewDraftVersion = async () => {
    if (formLocked) return
    const base = versions.find((v) => v.version === document.version) ?? document
    const draft = await createDraftFromVersion({ ...base, status: 'published' })
    navigate(riskRuleAuthoringEditPath(draft.ruleId, { version: draft.version }))
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={isNew ? ru.riskRuleAuthoring.editorCreateTitle : ru.riskRuleAuthoring.editorEditTitle}
        description={ru.riskRuleAuthoring.editorDescription}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to={riskRuleAuthoringListPath()}>
              <Button variant="secondary">{ru.riskRuleAuthoring.backToList}</Button>
            </Link>
            <Button
              type="button"
              variant="secondary"
              disabled={!canExport}
              title={!canExport ? ru.governance.actionDeniedRead : undefined}
              onClick={() => downloadRiskRuleConfigDocument(document)}
            >
              {ru.riskRuleAuthoring.exportJson}
            </Button>
          </div>
        }
      />

      {!canEdit ? (
        <GovernanceAccessBanner>{ru.governance.viewerReadOnlyBanner}</GovernanceAccessBanner>
      ) : !canPublish ? (
        <GovernanceAccessBanner tone="warning">
          {ru.governance.editorNoPublishBanner}
        </GovernanceAccessBanner>
      ) : null}

      {readOnlyBuiltin ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {ru.riskRuleAuthoring.builtinReadOnlyHint}
        </p>
      ) : null}

      {publishError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {ru.riskRuleAuthoring.publishFailed}
        </p>
      ) : null}

      {!readOnlyBuiltin ? (
        <AuthoringLifecycleIndicators reviewState={document.status} lifecycle={document.lifecycle} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <fieldset disabled={formLocked} className="border-0 p-0">
            <RiskRuleConfigForm
              document={document}
              readOnly={readOnlyBuiltin || formLocked}
              onChange={setDocument}
            />
          </fieldset>
          {!readOnlyBuiltin ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Button
                type="button"
                onClick={handleSaveDraft}
                disabled={!canEdit || !validation.canSaveDraft}
                title={!canEdit ? ru.governance.actionDeniedEdit : undefined}
              >
                {ru.riskRuleAuthoring.saveDraft}
              </Button>
              {!isNew && document.status === 'published' ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleNewDraftVersion}
                  disabled={!canEdit}
                  title={!canEdit ? ru.governance.actionDeniedEdit : undefined}
                >
                  {ru.riskRuleAuthoring.newDraftVersion}
                </Button>
              ) : null}
            </div>
          ) : null}
          {readOnlyBuiltin ? (
            <div className="mt-4">
              {canEdit ? (
                <Link
                  to={riskRuleAuthoringNewPath({
                    clone: true,
                    id: routeRuleId!,
                  })}
                >
                  <Button>{ru.riskRuleAuthoring.cloneBuiltin}</Button>
                </Link>
              ) : (
                <Button disabled title={ru.governance.actionDeniedEdit}>
                  {ru.riskRuleAuthoring.cloneBuiltin}
                </Button>
              )}
            </div>
          ) : null}
        </Card>

        <div className="space-y-4">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? ru.riskRuleAuthoring.hidePreview : ru.riskRuleAuthoring.showPreview}
          </Button>
          {showPreview ? <RiskRuleConfigPreview document={document} /> : null}
          <RiskRuleConfigValidationList
            blocking={validation.blocking}
            warnings={validation.warnings}
          />
          <RiskRuleConfigValidationList
            blocking={publishValidation.blocking}
            warnings={publishValidation.warnings}
            publishMode
          />
        </div>
      </div>

      {!readOnlyBuiltin ? (
        <AuthoringReviewActionsPanel
          reviewState={document.status}
          canEdit={canEdit}
          canPublish={canPublish && publishValidation.canPublish}
          disabled={!validation.canSaveDraft && document.status === 'draft'}
          onSubmitReview={runSubmitReview}
          onPublish={runPublish}
        />
      ) : null}

      {versions.length > 0 ? (
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            {ru.riskRuleAuthoring.versionsTitle}
          </h3>
          <ul className="space-y-2 text-sm">
            {versions.map((v) => (
              <li key={v.version} className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs">v{v.version}</span>
                <span className="text-slate-600">
                  {ru.riskRuleAuthoring.statusLabels[v.status]}
                </span>
                <Link to={riskRuleAuthoringEditPath(v.ruleId, { version: v.version })}>
                  <Button variant="secondary" className="!min-h-8 !px-2 !py-1 text-xs">
                    {ru.riskRuleAuthoring.openVersion}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {!readOnlyBuiltin && !isNew ? (
        <AuthoringVersionHistoryPanel
          entityType="risk_rule"
          entityId={document.ruleId}
          version={document.version}
          fetchEvents={auditFetcher}
        />
      ) : null}
    </div>
  )
}
