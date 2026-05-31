/** Base URL for registry API (empty = same origin, use Vite proxy in dev). */
export const REGISTRY_API_BASE =
  (import.meta.env.VITE_REGISTRY_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export const REGISTRY_MIGRATED_FLAG_KEY = 'scam_app_ru.registry_migrated.v1'
