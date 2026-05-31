import { ru } from '../content/ru'

export const WALLET_WARNING_CONTENT_KEYS = {
  'wallet.approval_access': 'approvalAccess',
  'wallet.check_permissions': 'checkPermissions',
  'wallet.no_recovery_on_unknown': 'noRecoveryOnUnknown',
  'wallet.pressure_scam': 'pressureScam',
} as const

export function walletWarningTextByKey(warningKey: string): string | undefined {
  const contentKey =
    WALLET_WARNING_CONTENT_KEYS[warningKey as keyof typeof WALLET_WARNING_CONTENT_KEYS]
  if (!contentKey) return undefined
  return ru.wallet.warnings[contentKey]
}

export const WALLET_SCREEN_TITLES: Record<string, string> = {
  wallet_home: ru.wallet.screens.walletHome,
  assets: ru.wallet.screens.assets,
  connect_service: ru.wallet.screens.connectApp,
  sign_operation: ru.wallet.screens.signatureRequest,
  asset_approval: ru.wallet.screens.approvalWarning,
  warning: ru.wallet.screens.approvalWarning,
  recovery_screen: ru.wallet.screens.recovery,
  result: ru.wallet.screens.result,
}
