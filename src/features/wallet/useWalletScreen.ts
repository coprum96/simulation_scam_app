import type { WalletScreenId } from '../../config/screens'
import { useTelemetry } from '../telemetry'

export function useWalletScreen(screenId: WalletScreenId) {
  return useTelemetry(screenId)
}
