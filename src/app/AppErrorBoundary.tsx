import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ru } from '../content/ru'

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[app]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f4faf8] px-6 text-center">
          <p className="text-base font-semibold text-slate-900">{ru.app.fatalErrorTitle}</p>
          <p className="max-w-lg text-sm text-slate-600">{ru.app.fatalErrorDescription}</p>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            onClick={() => window.location.reload()}
          >
            {ru.app.fatalErrorReload}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
