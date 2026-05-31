import { ExportJsonButton } from '../../../components/export/ExportJsonButton'
import { Card } from '../../../components/ui/Card'
import { ru } from '../../../content/ru'
import {
  exportComparativeAnalyticsDatasetCsv,
  exportRawSessionsDatasetCsv,
  exportSessionsJson,
} from '../../export'
import {
  exportAnalyticsSummaryCsv,
  exportAnalyticsSummaryJson,
} from '../exportAnalyticsSummary'
import { markExportVisited, notifyWorkflowChange } from '../../research-workflow'
import type { SessionAnalyticsSummary } from '../types'
import type { Session } from '../../../types/contracts'

type AnalyticsExportPanelProps = {
  filtered: Session[]
  summary: SessionAnalyticsSummary
  disabled: boolean
}

export function AnalyticsExportPanel({ filtered, summary, disabled }: AnalyticsExportPanelProps) {
  const markConclude = () => {
    markExportVisited()
    notifyWorkflowChange()
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-900">{ru.researcher.analyticsExportTitle}</h2>
        <p className="mt-1 text-sm text-slate-600">{ru.researcher.analyticsExportDescription}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <ExportJsonButton
          label={ru.analytics.exportSummaryJson}
          disabled={disabled}
          onClick={() => {
            markConclude()
            exportAnalyticsSummaryJson(summary)
          }}
        />
        <ExportJsonButton
          label={ru.analytics.exportSummaryCsv}
          disabled={disabled}
          onClick={() => exportAnalyticsSummaryCsv(summary)}
        />
        <ExportJsonButton
          label={ru.export.exportSessionsJson}
          disabled={disabled}
          onClick={() => exportSessionsJson(filtered)}
        />
        <ExportJsonButton
          label={ru.export.exportSessionsDatasetCsv}
          disabled={disabled}
          onClick={() => exportRawSessionsDatasetCsv(filtered)}
        />
        <ExportJsonButton
          label={ru.export.exportComparativeCsv}
          disabled={disabled}
          onClick={() => exportComparativeAnalyticsDatasetCsv(summary.comparative)}
        />
      </div>
    </Card>
  )
}
