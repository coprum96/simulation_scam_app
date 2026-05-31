import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES, authoringListPath } from '../../config'
import { ru } from '../../content/ru'
import { PageHeader } from '../../components/layout/PageHeader'
import { ResearcherHint } from '../../components/layout/ResearcherHint'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useGovernanceStore } from './governanceStore'

export function GovernanceLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? authoringListPath()

  const status = useGovernanceStore((s) => s.status)
  const error = useGovernanceStore((s) => s.error)
  const login = useGovernanceStore((s) => s.login)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (status === 'authenticated') {
    return <Navigate to={returnTo} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    const ok = await login(username.trim(), password)
    setSubmitting(false)
    if (ok) navigate(returnTo, { replace: true })
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        title={ru.governance.loginTitle}
        description={ru.governance.loginDescription}
      />
      <ResearcherHint tone="muted">{ru.researcher.loginHint}</ResearcherHint>
      <Card className="mt-4 space-y-4 p-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-800">
              {ru.governance.usernameLabel}
            </span>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-800">
              {ru.governance.passwordLabel}
            </span>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? (
            <p className="text-sm text-red-700">{ru.governance.loginInvalid}</p>
          ) : null}
          <Button type="submit" disabled={submitting} className="w-full">
            {ru.governance.loginSubmit}
          </Button>
        </form>
        <p className="text-xs leading-relaxed text-slate-500">{ru.governance.demoAccountsHint}</p>
        <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.scenarios)}>
          {ru.actions.backToSimulations}
        </Button>
      </Card>
    </div>
  )
}
