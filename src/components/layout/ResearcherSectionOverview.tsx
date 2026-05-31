import { Link } from 'react-router-dom'
import { ROUTES } from '../../config'
import { ru } from '../../content/ru'
import { Card } from '../ui/Card'

const sections = [
  { href: ROUTES.scenarios, title: ru.researcher.sections.simulations.title, description: ru.researcher.sections.simulations.description },
  { href: ROUTES.dashboard, title: ru.researcher.sections.analytics.title, description: ru.researcher.sections.analytics.description },
  { href: ROUTES.authoring, title: ru.researcher.sections.scenarioContent.title, description: ru.researcher.sections.scenarioContent.description },
  { href: ROUTES.riskAuthoring, title: ru.researcher.sections.riskRules.title, description: ru.researcher.sections.riskRules.description },
] as const

export function ResearcherSectionOverview() {
  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{ru.researcher.sectionOverviewTitle}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <Card key={section.href} className="flex flex-col p-4">
            <p className="text-sm font-medium text-slate-900">{section.title}</p>
            <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-600">{section.description}</p>
            <Link
              to={section.href}
              className="mt-3 text-xs font-medium text-teal-800 hover:text-teal-950 hover:underline"
            >
              {ru.researcher.sectionOpenLink}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
