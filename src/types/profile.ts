export type TraitLevel = 'low' | 'medium' | 'high'
export type ReactionSpeed = 'slow' | 'normal' | 'fast'

export type ProfileId =
  | 'normal_user'
  | 'elderly_vulnerable_user'
  | 'confident_digital_user'
  | 'wallet_power_user'

export type UserProfile = {
  id: ProfileId
  name: string
  description: string
  digitalConfidence: TraitLevel
  fraudAwareness: TraitLevel
  readingDepth: TraitLevel
  warningSensitivity: TraitLevel
  reactionSpeed: ReactionSpeed
}
