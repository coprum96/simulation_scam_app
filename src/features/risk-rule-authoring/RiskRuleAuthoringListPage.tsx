import { useEffect, useMemo, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { riskRuleAuthoringEditPath, riskRuleAuthoringNewPath, ROUTES } from '../../config'
import { ru } from '../../content/ru'
import { PageHeader } from '../../components/layout/PageHeader'
import { ResearcherHint } from '../../components/layout/ResearcherHint'
import { GuidedEmptyState } from '../../components/layout/GuidedEmptyState'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { listRiskRuleAuthoringCatalog } from './listRiskRuleAuthoringCatalog'
import { useRiskRuleAuthoringStore } from './riskRuleAuthoringStore'
import { parseRiskRuleConfigImportPayload } from './parseImportPayload'
import { validateImportDocuments } from './validateRiskRuleConfig'
import { GovernanceAccessBanner } from '../governance/GovernanceAccessBanner'
import { useGovernanceAccess } from '../governance/useGovernanceAccess'
import { AuthoringReviewStateBadge } from '../authoring-audit'

export function RiskRuleAuthoringListPage() {
  const { canEdit, canImport, canPublish } = useGovernanceAccess()
  const location = useLocation()
  const createDenied = (location.state as { accessDenied?: string } | null)?.accessDenied === 'create'
  const refreshKey = useRiskRuleAuthoringStore((s) => s.refreshKey)
  const ensureRegistry = useRiskRuleAuthoringStore((s) => s.ensureRegistry)
  const importDocuments = useRiskRuleAuthoringStore((s) => s.importDocuments)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void ensureRegistry()
  }, [ensureRegistry])

  const catalog = useMemo(() => {
    void refreshKey
    return listRiskRuleAuthoringCatalog()
  }, [refreshKey])

  const handleImportFile = async (file: File) => {
    if (!canImport) return
    let parsed: unknown
    try {
      parsed = JSON.parse(await file.text())
    } catch {
      window.alert(ru.riskRuleAuthoring.importInvalid)
      return
    }
    const documents = parseRiskRuleConfigImportPayload(parsed)
    if (!documents) {
      window.alert(ru.riskRuleAuthoring.importInvalid)
      return
    }
    const validation = validateImportDocuments(documents)
    if (!validation.valid) {
      window.alert(ru.riskRuleAuthoring.importValidationFailed)
      return
    }
    await importDocuments(documents)
    window.alert(ru.riskRuleAuthoring.importSuccess)
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
        title={ru.riskRuleAuthoring.listTitle}
        description={ru.riskRuleAuthoring.listDescription}
        actions={
          <div className="flex flex-wrap gap-2">
            {canEdit ? (
              <Link to={riskRuleAuthoringNewPath()}>
                <Button>{ru.riskRuleAuthoring.createRule}</Button>
              </Link>
            ) : (
              <Button disabled title={ru.governance.actionDeniedEdit}>
                {ru.riskRuleAuthoring.createRule}
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              disabled={!canImport}
              title={!canImport ? ru.governance.actionDeniedImport : undefined}
              onClick={() => fileInputRef.current?.click()}
            >
              {ru.riskRuleAuthoring.importJson}
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

      <ResearcherHint>{ru.researcher.rulesHint}</ResearcherHint>
      <p className="mb-5 text-xs text-slate-500 sm:mb-6">{ru.researcher.reviewStatesLegend}</p>

      {catalog.length === 0 ? (
        <GuidedEmptyState
          title={ru.researcher.rulesEmptyTitle}
          message={ru.researcher.rulesEmptyMessage}
          steps={ru.researcher.rulesEmptySteps}
        >
          {canEdit ? (
            <Link to={riskRuleAuthoringNewPath()}>
              <Button>{ru.riskRuleAuthoring.createRule}</Button>
            </Link>
          ) : null}
        </GuidedEmptyState>
      ) : (
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <th className="px-4 py-2.5 font-medium">{ru.riskRuleAuthoring.colRuleId}</th>
                <th className="px-4 py-2.5 font-medium">{ru.riskRuleAuthoring.colTitle}</th>
                <th className="px-4 py-2.5 font-medium">{ru.riskRuleAuthoring.colScore}</th>
                <th className="px-4 py-2.5 font-medium">{ru.riskRuleAuthoring.colEnabled}</th>
                <th className="px-4 py-2.5 font-medium">{ru.riskRuleAuthoring.colSource}</th>
                <th className="px-4 py-2.5 font-medium">{ru.riskRuleAuthoring.colVersion}</th>
                <th className="px-4 py-2.5 font-medium">{ru.audit.listColReviewState}</th>
                <th className="px-4 py-2.5 font-medium">{ru.audit.listColLastModified}</th>
                <th className="px-4 py-2.5 font-medium">{ru.audit.listColPublishedAt}</th>
                <th className="px-4 py-2.5 font-medium">{ru.riskRuleAuthoring.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {catalog.map((item) => (
                <tr key={item.ruleId} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs text-slate-800">{item.ruleId}</td>
                  <td className="px-4 py-3 text-slate-900">{item.title}</td>
                  <td className="px-4 py-3 font-mono text-slate-800">
                    {item.scoreDelta > 0 ? '+' : ''}
                    {item.scoreDelta}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.enabled
                      ? ru.riskRuleAuthoring.enabledYes
                      : ru.riskRuleAuthoring.enabledNo}
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
                        ? ru.riskRuleAuthoring.sourceBuiltin
                        : item.hasAuthoredOverride
                          ? ru.riskRuleAuthoring.sourceOverride
                          : ru.riskRuleAuthoring.sourceAuthored}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">v{item.version}</td>
                  <td className="px-4 py-3">
                    {item.source === 'authored' ? (
                      <AuthoringReviewStateBadge state={item.status} />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{item.lastModifiedLabel}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{item.publishedAtLabel}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link to={riskRuleAuthoringEditPath(item.ruleId)}>
                        <Button variant="secondary" className="!min-h-9 !px-3 !py-1.5 text-xs">
                          {ru.riskRuleAuthoring.editRule}
                        </Button>
                      </Link>
                      {item.source === 'builtin' ? (
                        canEdit ? (
                          <Link
                            to={riskRuleAuthoringNewPath({
                              clone: true,
                              id: item.ruleId,
                            })}
                          >
                            <Button variant="secondary" className="!min-h-9 !px-3 !py-1.5 text-xs">
                              {ru.riskRuleAuthoring.cloneBuiltin}
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            variant="secondary"
                            className="!min-h-9 !px-3 !py-1.5 text-xs"
                            disabled
                            title={ru.governance.actionDeniedEdit}
                          >
                            {ru.riskRuleAuthoring.cloneBuiltin}
                          </Button>
                        )
                      ) : null}
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
