import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ru } from '../../content/ru'
import { EmptyState } from '../../components/ui/EmptyState'

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

export class AnalyticsErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[analytics]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return <EmptyState message={ru.analytics.renderError} />
    }
    return this.props.children
  }
}
