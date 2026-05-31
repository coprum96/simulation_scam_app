import { useState } from 'react'
import { ru } from '../../content/ru'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import type { AuthoringReviewState } from '../../types/authoringLifecycle'

type AuthoringReviewActionsPanelProps = {
  reviewState: AuthoringReviewState
  canEdit: boolean
  canPublish: boolean
  onSubmitReview: (note?: string) => Promise<void>
  onPublish: (note?: string) => Promise<void>
  disabled?: boolean
}

export function AuthoringReviewActionsPanel({
  reviewState,
  canEdit,
  canPublish,
  onSubmitReview,
  onPublish,
  disabled = false,
}: AuthoringReviewActionsPanelProps) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const showSubmit = canEdit && reviewState === 'draft'
  const showPublish = canPublish && (reviewState === 'draft' || reviewState === 'in_review')

  if (!showSubmit && !showPublish) return null

  const run = async (action: 'review' | 'publish') => {
    setBusy(true)
    try {
      if (action === 'review') await onSubmitReview(note.trim() || undefined)
      else await onPublish(note.trim() || undefined)
      setNote('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="space-y-3 p-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-800">
          {showPublish ? ru.audit.publishNoteLabel : ru.audit.changeNoteLabel}
        </span>
        <textarea
          className="min-h-[72px] w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          value={note}
          disabled={disabled || busy}
          onChange={(e) => setNote(e.target.value)}
          maxLength={2000}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {showSubmit ? (
          <Button
            type="button"
            variant="secondary"
            disabled={disabled || busy}
            onClick={() => void run('review')}
          >
            {ru.audit.submitForReview}
          </Button>
        ) : null}
        {showPublish ? (
          <Button type="button" disabled={disabled || busy} onClick={() => void run('publish')}>
            {ru.audit.publishWithNote}
          </Button>
        ) : null}
      </div>
      {showSubmit ? (
        <p className="text-xs text-slate-500">{ru.audit.submitForReviewHint}</p>
      ) : null}
    </Card>
  )
}
