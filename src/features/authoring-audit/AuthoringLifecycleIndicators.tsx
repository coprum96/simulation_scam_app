import { ru } from '../../content/ru'
import type { AuthoringDocumentLifecycle } from '../../types/authoringLifecycle'
import type { AuthoringReviewState } from '../../types/authoringLifecycle'
import { AuthoringReviewStateBadge } from './AuthoringReviewStateBadge'
import { formatActorName, formatAuditTimestamp } from './formatAudit'

type AuthoringLifecycleIndicatorsProps = {
  reviewState: AuthoringReviewState
  lifecycle?: AuthoringDocumentLifecycle
}

export function AuthoringLifecycleIndicators({
  reviewState,
  lifecycle,
}: AuthoringLifecycleIndicatorsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
      <p className="mb-2 font-medium text-slate-900">{ru.audit.lifecycleTitle}</p>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">{ru.audit.reviewState}</dt>
          <dd className="mt-0.5">
            <AuthoringReviewStateBadge state={reviewState} />
          </dd>
        </div>
        {lifecycle?.lastModifiedBy ? (
          <div>
            <dt className="text-xs text-slate-500">{ru.audit.lastModifiedBy}</dt>
            <dd className="mt-0.5 font-medium text-slate-900">
              {formatActorName(lifecycle.lastModifiedBy.displayName)}
            </dd>
          </div>
        ) : null}
        {lifecycle?.lastModifiedAt ? (
          <div>
            <dt className="text-xs text-slate-500">{ru.audit.lastModifiedAt}</dt>
            <dd className="mt-0.5">{formatAuditTimestamp(lifecycle.lastModifiedAt)}</dd>
          </div>
        ) : null}
        {lifecycle?.publishedBy ? (
          <div>
            <dt className="text-xs text-slate-500">{ru.audit.publishedBy}</dt>
            <dd className="mt-0.5 font-medium text-slate-900">
              {formatActorName(lifecycle.publishedBy.displayName)}
            </dd>
          </div>
        ) : null}
        {lifecycle?.publishedAt ? (
          <div>
            <dt className="text-xs text-slate-500">{ru.audit.publishedAt}</dt>
            <dd className="mt-0.5">{formatAuditTimestamp(lifecycle.publishedAt)}</dd>
          </div>
        ) : null}
        {lifecycle?.lastPublishNote ? (
          <div className="sm:col-span-2">
            <dt className="text-xs text-slate-500">{ru.audit.publishNoteLabel}</dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-slate-800">
              {lifecycle.lastPublishNote}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
