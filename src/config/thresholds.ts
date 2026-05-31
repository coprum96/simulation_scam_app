/** Порог крупного перевода (₽), см. project-docs/SCENARIOS_RU.md */
export const HIGH_TRANSFER_AMOUNT_RUB = 150_000

/** Пороги уровня риска по score, см. project-docs/RISK_RULES.md */
export const RISK_SCORE_THRESHOLDS = {
  lowMax: 29,
  mediumMax: 59,
  highMax: 100,
} as const

/** Быстрое подтверждение в рискованном сценарии (мс) */
export const FAST_CONFIRMATION_MS = 5_000

/** Минимум переходов «назад» для multiple_back_navigation_loops */
export const NAVIGATION_LOOP_BACK_COUNT = 3

/** Минимум commit input_change для repeated_field_edits */
export const FIELD_EDIT_COUNT_THRESHOLD = 3

export const DEFAULT_PROFILE_ID = 'normal_user'
