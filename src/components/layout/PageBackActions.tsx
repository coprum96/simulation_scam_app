import { Link } from 'react-router-dom'
import { ROUTES } from '../../config'
import { ru } from '../../content/ru'
import { Button } from '../ui/Button'

type PageBackActionsProps = {
  analyticsTo?: string
  showAnalytics?: boolean
  showSimulations?: boolean
}

export function PageBackActions({
  analyticsTo = ROUTES.dashboard,
  showAnalytics = false,
  showSimulations = true,
}: PageBackActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {showAnalytics ? (
        <Link to={analyticsTo}>
          <Button variant="secondary">{ru.actions.backToAnalytics}</Button>
        </Link>
      ) : null}
      {showSimulations ? (
        <Link to={ROUTES.scenarios}>
          <Button variant="secondary">{ru.actions.backToSimulations}</Button>
        </Link>
      ) : null}
    </div>
  )
}
