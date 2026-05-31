import { Link } from 'react-router-dom'
import { ru } from '../../../content/ru'
import type { AnalyticsFilterState } from '../analyticsFilters'
import { analyticsDashboardPath } from '../analyticsPaths'

export type AnalyticsBreadcrumbItem = {
  label: string
  to?: string
}

type AnalyticsBreadcrumbsProps = {
  items: AnalyticsBreadcrumbItem[]
  filters?: AnalyticsFilterState
}

export function AnalyticsBreadcrumbs({ items, filters }: AnalyticsBreadcrumbsProps) {
  return (
    <nav aria-label={ru.analytics.breadcrumbsLabel} className="mb-4 text-sm text-slate-600">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            to={analyticsDashboardPath(filters)}
            className="font-medium text-teal-700 hover:text-teal-900"
          >
            {ru.analytics.breadcrumbDashboard}
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            <span aria-hidden className="text-slate-400">
              /
            </span>
            {item.to ? (
              <Link to={item.to} className="font-medium text-teal-700 hover:text-teal-900">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
