export type AuthoringActor = {
  id: string
  username: string
  displayName: string
}

export type AuthoringDocumentLifecycle = {
  lastModifiedBy?: AuthoringActor
  lastModifiedAt?: string
  publishedBy?: AuthoringActor
  publishedAt?: string
  lastPublishNote?: string
}

export const AUTHORING_REVIEW_STATES = ['draft', 'in_review', 'published'] as const
export type AuthoringReviewState = (typeof AUTHORING_REVIEW_STATES)[number]
