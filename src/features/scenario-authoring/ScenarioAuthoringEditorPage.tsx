import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { authoringEditPath, authoringListPath, ROUTES } from '../../config'
import { ru } from '../../content/ru'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { listAuthoredScenarioIds } from './scenarioAuthoringPersistence'
import { listBuiltinScenarioIds } from './builtinScenarioToConfig'
import { downloadScenarioConfigDocument } from './downloadScenarioConfig'
import { ScenarioConfigMetadataForm } from './components/ScenarioConfigMetadataForm'
import { ScenarioConfigPreview } from './components/ScenarioConfigPreview'
import { ScenarioConfigStepsEditor } from './components/ScenarioConfigStepsEditor'
import { ScenarioConfigValidationList } from './components/ScenarioConfigValidationList'
import { isBuiltinReadOnlyView, resolveEditorDocument } from './resolveEditorDocument'
import { useScenarioAuthoringStore } from './scenarioAuthoringStore'
import { validateScenarioConfigFull } from './validateScenarioConfigFull'
import type { ScenarioConfigDocument } from '../../types/scenarioConfig'
import type { SimulatorType } from '../../types/scenario'
import {
  AuthoringLifecycleIndicators,
  AuthoringReviewActionsPanel,
  AuthoringVersionHistoryPanel,
} from '../authoring-audit'
import { GovernanceAccessBanner } from '../governance/GovernanceAccessBanner'
import { useGovernanceAccess } from '../governance/useGovernanceAccess'

export function ScenarioAuthoringEditorPage() {
  const { canEdit, canExport, canPublish } = useGovernanceAccess()
  const navigate = useNavigate()
  const { scenarioId: routeScenarioId } = useParams()
  const [searchParams] = useSearchParams()
  const isNew = routeScenarioId === 'new'
  const cloneBuiltin = searchParams.get('clone') === 'true'
  const versionParam = Number(searchParams.get('version'))
  const simulatorParam = (searchParams.get('simulator') as SimulatorType) || null
  const idParam = searchParams.get('id')

  const refreshKey = useScenarioAuthoringStore((s) => s.refreshKey)
  const listVersions = useScenarioAuthoringStore((s) => s.listVersions)
  const saveDocument = useScenarioAuthoringStore((s) => s.saveDocument)
  const publishDocument = useScenarioAuthoringStore((s) => s.publishDocument)
  const submitForReview = useScenarioAuthoringStore((s) => s.submitForReview)
  const fetchAuditTrail = useScenarioAuthoringStore((s) => s.fetchAuditTrail)
  const createDraftFromVersion = useScenarioAuthoringStore((s) => s.createDraftFromVersion)

  const persistedScenarioIdRef = useRef<string | null>(null)

  const resolvedDocument = useMemo(() => {
    void refreshKey
    return resolveEditorDocument({
      routeScenarioId,
      isNew,
      cloneBuiltin,
      versionParam,
      simulatorParam,
      idParam,
    })
  }, [
    refreshKey,
    routeScenarioId,
    isNew,
    cloneBuiltin,
    versionParam,
    simulatorParam,
    idParam,
  ])

  const [document, setDocument] = useState<ScenarioConfigDocument>(resolvedDocument)
  const [showPreview, setShowPreview] = useState(true)
  const [publishError, setPublishError] = useState(false)

  const auditFetcher = useMemo(
    () => () => fetchAuditTrail(document.scenarioId, document.version),
    [fetchAuditTrail, document.scenarioId, document.version, refreshKey],
  )

  useEffect(() => {
    setDocument(resolvedDocument)
    setPublishError(false)
    if (!isNew && resolvedDocument.status !== 'draft' && !cloneBuiltin) {
      persistedScenarioIdRef.current = resolvedDocument.scenarioId
    } else if (isNew) {
      persistedScenarioIdRef.current = null
    }
  }, [resolvedDocument, isNew, cloneBuiltin])

  const readOnlyBuiltin = isBuiltinReadOnlyView(routeScenarioId, isNew, cloneBuiltin)
  const formLocked = readOnlyBuiltin || !canEdit
  const versions = !isNew && routeScenarioId ? listVersions(routeScenarioId) : []

  const validation = useMemo(() => {
    const knownScenarioIds = [...listAuthoredScenarioIds(), ...listBuiltinScenarioIds()]
    return validateScenarioConfigFull(document, knownScenarioIds)
  }, [document])

  const handleSaveDraft = async () => {
    if (!canEdit || !validation.canSaveDraft) return
    const payload: ScenarioConfigDocument = {
      ...document,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    }
    await saveDocument(payload, {
      previousScenarioId: persistedScenarioIdRef.current ?? undefined,
    })
    persistedScenarioIdRef.current = payload.scenarioId
    setDocument(payload)
    if (isNew) {
      navigate(authoringEditPath(payload.scenarioId, { version: payload.version }), { replace: true })
    }
  }

  const runPublish = async (note?: string) => {
    if (!canPublish || !validation.canPublish) {
      setPublishError(true)
      return
    }
    setPublishError(false)
    const payload: ScenarioConfigDocument = {
      ...document,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    }
    await saveDocument(payload, {
      previousScenarioId: persistedScenarioIdRef.current ?? undefined,
    })
    persistedScenarioIdRef.current = payload.scenarioId
    const published = await publishDocument(payload.scenarioId, payload.version, { note })
    if (!published) {
      setPublishError(true)
      return
    }
    setDocument(published)
  }

  const runSubmitReview = async (note?: string) => {
    if (!canEdit) return
    const payload: ScenarioConfigDocument = {
      ...document,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    }
    await saveDocument(payload, {
      previousScenarioId: persistedScenarioIdRef.current ?? undefined,
    })
    persistedScenarioIdRef.current = payload.scenarioId
    const updated = await submitForReview(payload.scenarioId, payload.version, { note })
    if (updated) setDocument(updated)
  }

  const handleNewDraftVersion = async () => {
    if (formLocked) return
    const draft = await createDraftFromVersion(document)
    persistedScenarioIdRef.current = draft.scenarioId
    navigate(authoringEditPath(draft.scenarioId, { version: draft.version }))
    setDocument(draft)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={isNew ? ru.authoring.editorCreateTitle : ru.authoring.editorEditTitle}
        description={ru.authoring.editorDescription}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to={authoringListPath()}>
              <Button variant="secondary">{ru.authoring.backToList}</Button>
            </Link>
            <Link to={ROUTES.scenarios}>
              <Button variant="ghost">{ru.buttons.backToScenarios}</Button>
            </Link>
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
        <Card>
          <p className="text-sm text-slate-600">{ru.authoring.builtinReadOnlyHint}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {canEdit ? (
              <Link to={authoringEditPath(routeScenarioId ?? '', { clone: true })}>
                <Button>{ru.authoring.cloneBuiltin}</Button>
              </Link>
            ) : (
              <Button disabled title={ru.governance.actionDeniedEdit}>
                {ru.authoring.cloneBuiltin}
              </Button>
            )}
          </div>
        </Card>
      ) : null}

      {publishError ? (
        <p className="text-sm text-amber-800">{ru.authoring.publishFailed}</p>
      ) : null}

      {!readOnlyBuiltin ? (
        <AuthoringLifecycleIndicators
          reviewState={document.status}
          lifecycle={document.lifecycle}
        />
      ) : null}

      {versions.length > 0 ? (
        <Card>
          <p className="mb-2 text-sm font-medium text-slate-900">{ru.authoring.versionsTitle}</p>
          <div className="flex flex-wrap gap-2">
            {versions.map((version) => (
              <Link
                key={version.version}
                to={authoringEditPath(version.scenarioId, { version: version.version })}
              >
                <Button variant={version.version === document.version ? 'primary' : 'secondary'}>
                  v{version.version} · {ru.authoring.statusLabels[version.status]}
                </Button>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}

      <ScenarioConfigValidationList
        blocking={validation.blocking}
        warnings={validation.warnings}
      />

      <fieldset disabled={formLocked} className="grid gap-5 border-0 p-0 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold text-slate-900">{ru.authoring.metadataTitle}</h2>
          <ScenarioConfigMetadataForm
            document={document}
            onChange={setDocument}
            idEditable={!formLocked && (isNew || document.status === 'draft')}
          />
        </Card>

        <Card>
          <ScenarioConfigStepsEditor
            document={document}
            onChange={setDocument}
            blocking={validation.blocking}
            warnings={validation.warnings}
          />
        </Card>
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => setShowPreview((v) => !v)}>
          {showPreview ? ru.authoring.hidePreview : ru.authoring.showPreview}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={!canExport}
          title={!canExport ? ru.governance.actionDeniedRead : undefined}
          onClick={() => downloadScenarioConfigDocument(document)}
        >
          {ru.authoring.exportJson}
        </Button>
        {!readOnlyBuiltin ? (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={!canEdit || !validation.canSaveDraft}
              title={!canEdit ? ru.governance.actionDeniedEdit : undefined}
            >
              {ru.authoring.saveDraft}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleNewDraftVersion}
              disabled={!canEdit}
              title={!canEdit ? ru.governance.actionDeniedEdit : undefined}
            >
              {ru.authoring.newDraftVersion}
            </Button>
          </>
        ) : null}
      </div>

      {!readOnlyBuiltin ? (
        <AuthoringReviewActionsPanel
          reviewState={document.status}
          canEdit={canEdit}
          canPublish={canPublish && validation.canPublish}
          disabled={!validation.canSaveDraft && document.status === 'draft'}
          onSubmitReview={runSubmitReview}
          onPublish={runPublish}
        />
      ) : null}

      <ScenarioConfigValidationList
        blocking={validation.blocking}
        warnings={validation.warnings}
        publishMode
      />

      {!readOnlyBuiltin && !isNew ? (
        <AuthoringVersionHistoryPanel
          entityType="scenario"
          entityId={document.scenarioId}
          version={document.version}
          fetchEvents={auditFetcher}
        />
      ) : null}

      {showPreview ? (
        <ScenarioConfigPreview document={document} />
      ) : null}
    </div>
  )
}
