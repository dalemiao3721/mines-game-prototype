import type { RTPSetting } from '@mines-game/shared'

export const VALID_RTP_VALUES: readonly RTPSetting[] = [94, 96, 97, 98, 99] as const

export const DEFAULT_RTP: RTPSetting = 96

export const TOTAL_TILES = 25
export const MIN_MINES = 1
export const MAX_MINES = 24

export function isValidRTP(value: number): value is RTPSetting {
  return (VALID_RTP_VALUES as readonly number[]).includes(value)
}
