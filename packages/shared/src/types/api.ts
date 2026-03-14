import type { RTPSetting } from './game'

// POST /api/game/start
export interface StartGameRequest {
  betAmount: number
  mineCount: number
  rtp: RTPSetting
}

export interface StartGameResponse {
  sessionId: string
  serverSeedHash: string
  multiplier: number
}

// POST /api/game/pick
export interface PickTileRequest {
  sessionId: string
  tileIndex: number
}

export interface PickTileSafeResponse {
  result: 'safe'
  newMultiplier: number
  pickedTiles: number[]
}

export interface PickTileMineResponse {
  result: 'mine'
  serverSeed: string
  minePositions: number[]
  payout: 0
}

export type PickTileResponse = PickTileSafeResponse | PickTileMineResponse

// POST /api/game/cashout
export interface CashoutRequest {
  sessionId: string
}

export interface CashoutResponse {
  payout: number
  finalMultiplier: number
  serverSeed: string
  minePositions: number[]
}
