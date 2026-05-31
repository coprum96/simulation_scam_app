import type { UserProfile } from '../types/profile'

/** Синхронизировано с project-docs/SCENARIOS_RU.md (Machine-readable) */
export const mockProfiles: UserProfile[] = [
  {
    id: 'normal_user',
    name: 'Обычный пользователь',
    description: 'Средняя цифровая уверенность и осведомлённость о мошенничестве',
    digitalConfidence: 'medium',
    fraudAwareness: 'medium',
    readingDepth: 'medium',
    warningSensitivity: 'medium',
    reactionSpeed: 'normal',
  },
  {
    id: 'elderly_vulnerable_user',
    name: 'Пожилой уязвимый пользователь',
    description: 'Пользователь с низкой цифровой уверенностью и высокой внушаемостью',
    digitalConfidence: 'low',
    fraudAwareness: 'low',
    readingDepth: 'low',
    warningSensitivity: 'medium',
    reactionSpeed: 'slow',
  },
  {
    id: 'confident_digital_user',
    name: 'Уверенный цифровой пользователь',
    description: 'Высокая уверенность, иногда пропускает детали из-за поспешности',
    digitalConfidence: 'high',
    fraudAwareness: 'medium',
    readingDepth: 'low',
    warningSensitivity: 'low',
    reactionSpeed: 'fast',
  },
  {
    id: 'wallet_power_user',
    name: 'Опытный пользователь кошелька',
    description: 'Регулярно пользуется кошельком, но может подтверждать действия без проверки',
    digitalConfidence: 'high',
    fraudAwareness: 'medium',
    readingDepth: 'medium',
    warningSensitivity: 'medium',
    reactionSpeed: 'fast',
  },
]

export function getProfileById(id: string): UserProfile | undefined {
  return mockProfiles.find((p) => p.id === id)
}
