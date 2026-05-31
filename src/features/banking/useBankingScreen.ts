import type { BankingScreenId } from '../../config/screens'
import { useTelemetry } from '../telemetry'

/** screen_view логируется в useBankingFlow (один раз на шаг), не здесь */
export function useBankingScreen(screenId: BankingScreenId) {
  return useTelemetry(screenId)
}
