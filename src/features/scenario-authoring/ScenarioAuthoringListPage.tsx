import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getRegistryBootstrapState,
  subscribeRegistryBootstrap,
} from '../../registry/bootstrapRegistry'
import { Link, useLocation } from 'react-router-dom'
import { authoringEditPath, authoringNewPath, ROUTES } from '../../config'
import { ru } from '../../content/ru'
import { PageHeader } from '../../components/layout/PageHeader'
import { ResearcherHint } from '../../components/layout/ResearcherHint'
import { GuidedEmptyState } from '../../components/layout/GuidedEmptyState'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { riskLevelBadgeClass, riskLevelLabel, simulatorLabel } from '../../config'
import { listAuthoringCatalog } from './listAuthoringCatalog'
import { useScenarioAuthoringStore } from './scenarioAuthoringStore'
import { parseScenarioConfigImportPayload } from './parseImportPayload'
import { validateImportDocuments } from './validateScenarioConfig'
import { GovernanceAccessBanner } from '../governance/GovernanceAccessBanner'
import { useGovernanceAccess } from '../governance/useGovernanceAccess'
import { AuthoringReviewStateBadge } from '../authoring-audit'

export function ScenarioAuthoringListPage() {
  const { canEdit, canImport, canPublish } = useGovernanceAccess()
  const location = useLocation()
  const createDenied = (location.state as { accessDenied?: string } | null)?.accessDenied === 'create'
  const [boot, setBoot] = useState(() => getRegistryBootstrapState())
  const refreshKey = useScenarioAuthoringStore((s) => s.refreshKey)
  const ensureRegistry = useScenarioAuthoringStore((s) => s.ensureRegistry)
  const importDocuments = useScenarioAuthoringStore((s) => s.importDocuments)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => subscribeRegistryBootstrap(() => setBoot(getRegistryBootstrapState())), [])

  useEffect(() => {
    void ensureRegistry()
  }, [ensureRegistry])

  const catalog = useMemo(() => {
    void refreshKey
    return listAuthoringCatalog()
  }, [refreshKey])

  if (boot.status === 'loading' || boot.status === 'idle') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-slate-800">{ru.registry.appLoadingTitle}</p>
        <p className="max-w-md text-sm text-slate-500">{ru.registry.loading}</p>
      </div>
    )
  }

  const handleImportFile = async (file: File) => {
    if (!canImport) return
    let parsed: unknown
    try {
      parsed = JSON.parse(await file.text())
    } catch {
      window.alert(ru.authoring.importInvalid)
      return
    }

    const documents = parseScenarioConfigImportPayload(parsed)
    if (!documents) {
      window.alert(ru.authoring.importInvalid)
      return
    }
    const validation = validateImportDocuments(documents)
    if (!validation.valid) {
      window.alert(ru.authoring.importValidationFailed)
      return
    }
    await importDocuments(documents)
    window.alert(ru.authoring.importSuccess)
  }

  return (
    <div>
      {createDenied ? (
        <GovernanceAccessBanner tone="warning">
          {ru.governance.createRouteDenied}
        </GovernanceAccessBanner>
      ) : null}
      {!canEdit ? (
        <GovernanceAccessBanner>{ru.governance.viewerReadOnlyBanner}</GovernanceAccessBanner>
      ) : !canPublish ? (
        <GovernanceAccessBanner tone="warning">
          {ru.governance.editorNoPublishBanner}
        </GovernanceAccessBanner>
      ) : null}
      <PageHeader
        eyebrow={ru.nav.groupContent}
        title={ru.authoring.listTitle}
        description={ru.authoring.listDescription}
        actions={
          <div className="flex flex-wrap gap-2">
            {canEdit ? (
              <>
                <Link to={authoringNewPath('banking')}>
                  <Button>{ru.authoring.createScenario}</Button>
                </Link>
                <Link to={authoringNewPath('wallet')}>
                  <Button variant="secondary">{ru.authoring.createWalletScenario}</Button>
                </Link>
              </>
            ) : (
              <>
                <Button disabled title={ru.governance.actionDeniedEdit}>
                  {ru.authoring.createScenario}
                </Button>
                <Button variant="secondary" disabled title={ru.governance.actionDeniedEdit}>
                  {ru.authoring.createWalletScenario}
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="secondary"
              disabled={!canImport}
              title={!canImport ? ru.governance.actionDeniedImport : undefined}
              onClick={() => fileInputRef.current?.click()}
            >
              {ru.authoring.importJson}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleImportFile(file)
                e.target.value = ''
              }}
            />
            <Link to={ROUTES.scenarios}>
              <Button variant="secondary">{ru.actions.backToSimulations}</Button>
            </Link>
          </div>
        }
      />

      <ResearcherHint>{ru.researcher.authoringHint}</ResearcherHint>
      <p className="mb-5 text-xs text-slate-500 sm:mb-6">{ru.researcher.reviewStatesLegend}</p>

      {catalog.length === 0 ? (
        <GuidedEmptyState
          title={ru.researcher.authoringEmptyTitle}
          message={ru.researcher.authoringEmptyMessage}
          steps={ru.researcher.authoringEmptySteps}
        >
          {canEdit ? (
            <div className="flex flex-wrap gap-2">
              <Link to={authoringNewPath('banking')}>
                <Button>{ru.authoring.createScenario}</Button>
              </Link>
              <Button
                type="button"
                variant="secondary"
                disabled={!canImport}
                onClick={() => fileInputRef.current?.click()}
              >
                {ru.authoring.importJson}
              </Button>
            </div>
          ) : null}
        </GuidedEmptyState>
      ) : (
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <th className="px-4 py-2.5 font-medium">{ru.authoring.colScenarioId}</th>
                <th className="px-4 py-2.5 font-medium">{ru.authoring.colTitle}</th>
                <th className="px-4 py-2.5 font-medium">{ru.authoring.colSimulator}</th>
                <th className="px-4 py-2.5 font-medium">{ru.authoring.colRisk}</th>
                <th className="px-4 py-2.5 font-medium">{ru.authoring.colSource}</th>
                <th className="px-4 py-2.5 font-medium">{ru.authoring.colVersion}</th>
                <th className="px-4 py-2.5 font-medium">{ru.audit.listColReviewState}</th>
                <th className="px-4 py-2.5 font-medium">{ru.audit.listColLastModified}</th>
                <th className="px-4 py-2.5 font-medium">{ru.audit.listColPublishedAt}</th>
                <th className="px-4 py-2.5 font-medium">{ru.authoring.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {catalog.map((item) => (
                <tr key={`${item.source}-${item.scenarioId}`} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs text-slate-800">{item.scenarioId}</td>
                  <td className="px-4 py-3 text-slate-900">{item.title}</td>
                  <td className="px-4 py-3 text-slate-700">{simulatorLabel(item.simulatorType)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${riskLevelBadgeClass(item.riskLevel)}`}
                    >
                      {riskLevelLabel(item.riskLevel)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        item.source === 'builtin'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-teal-50 text-teal-800'
                      }
                    >
                      {item.source === 'builtin'
                        ? ru.authoring.sourceBuiltin
                        : ru.authoring.sourceAuthored}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.versionLabel}</td>
                  <td className="px-4 py-3">
                    {item.source === 'authored' ? (
                      <AuthoringReviewStateBadge state={item.status as 'draft' | 'in_review' | 'published'} />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{item.lastModifiedLabel}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{item.publishedAtLabel}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {item.source === 'authored' ? (
                        <Link to={authoringEditPath(item.scenarioId)}>
                          <Button variant="secondary">{ru.authoring.editScenario}</Button>
                        </Link>
                      ) : canEdit ? (
                        <Link to={authoringEditPath(item.scenarioId, { clone: true })}>
                          <Button variant="ghost">{ru.authoring.cloneBuiltin}</Button>
                        </Link>
                      ) : (
                        <Button variant="ghost" disabled title={ru.governance.actionDeniedEdit}>
                          {ru.authoring.cloneBuiltin}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  )
}
