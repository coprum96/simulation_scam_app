import type { Scenario } from '../../types/scenario'
import { riskLevelBadgeClass, riskLevelLabel, simulatorLabel } from '../../config'
import { ru } from '../../content/ru'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

type ScenarioCardProps = {
  scenario: Scenario
  onStart: (scenarioId: string) => void
  profileSupported: boolean
}

export function ScenarioCard({ scenario, onStart, profileSupported }: ScenarioCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge className="bg-slate-100 text-slate-700">{simulatorLabel(scenario.simulatorType)}</Badge>
        <Badge className={riskLevelBadgeClass(scenario.riskLevel)}>
          {riskLevelLabel(scenario.riskLevel)}
        </Badge>
        <Badge
          className={
            scenario.warningsEnabled
              ? 'bg-teal-100 text-teal-900'
              : 'bg-slate-100 text-slate-500'
          }
        >
          {scenario.warningsEnabled ? ru.hub.warningsOn : ru.hub.warningsOff}
        </Badge>
      </div>

      <h3 className="text-base font-semibold leading-snug text-slate-900">{scenario.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{scenario.description}</p>

      <p className="mt-3 text-xs text-slate-500">
        {ru.hub.stepsLabel}: {scenario.steps.length}
      </p>

      <Button
        className="mt-4 w-full"
        disabled={!profileSupported}
        onClick={() => onStart(scenario.id)}
      >
        {ru.buttons.startScenario}
      </Button>

      {!profileSupported ? (
        <p className="mt-2 text-xs text-amber-700">{ru.hub.profileNotSupported}</p>
      ) : null}
    </Card>
  )
}
