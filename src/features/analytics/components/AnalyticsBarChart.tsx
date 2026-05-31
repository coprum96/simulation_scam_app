import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'

export type AnalyticsBarChartItem = {
  label: string
  count: number
  percent: number
  tone?: 'teal' | 'amber' | 'slate' | 'rose'
  href?: string
}

const toneClass: Record<NonNullable<AnalyticsBarChartItem['tone']>, string> = {
  teal: 'bg-teal-600',
  amber: 'bg-amber-500',
  slate: 'bg-slate-500',
  rose: 'bg-rose-500',
}

type AnalyticsBarChartProps = {
  title: string
  items: AnalyticsBarChartItem[]
  emptyLabel: string
}

export function AnalyticsBarChart({ title, items, emptyLabel }: AnalyticsBarChartProps) {
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                {item.href ? (
                  <Link
                    to={item.href}
                    className="truncate font-medium text-teal-700 hover:text-teal-900"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="truncate text-slate-700">{item.label}</span>
                )}
                <span className="shrink-0 font-medium text-slate-900">
                  {item.count} ({item.percent}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${toneClass[item.tone ?? 'teal']}`}
                  style={{ width: `${Math.max(item.percent, item.count > 0 ? 4 : 0)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
