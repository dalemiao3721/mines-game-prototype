import type { RTPSetting } from '@mines-game/shared'
import { calcMultiplier } from '../utils/combinatorics'
import { VALID_RTP_VALUES } from '../config/rtp.config'

export function getMultiplier(
  mineCount: number,
  openedTiles: number,
  rtp: RTPSetting,
): number {
  return calcMultiplier(mineCount, openedTiles, rtp)
}

export function getAvailableRTPValues(): readonly RTPSetting[] {
  return VALID_RTP_VALUES
}
