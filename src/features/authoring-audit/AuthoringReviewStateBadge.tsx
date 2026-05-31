import { ru } from '../../content/ru'
import type { AuthoringReviewState } from '../../types/authoringLifecycle'

type AuthoringReviewStateBadgeProps = {
  state: AuthoringReviewState
}

const toneClass: Record<AuthoringReviewState, string> = {
  draft: 'bg-slate-100 text-slate-700',
  in_review: 'bg-amber-50 text-amber-900',
  published: 'bg-teal-50 text-teal-800',
}

export function AuthoringReviewStateBadge({ state }: AuthoringReviewStateBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${toneClass[state]}`}
    >
      {ru.authoring.statusLabels[state]}
    </span>
  )
}
