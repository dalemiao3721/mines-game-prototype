import type { RTPSetting } from './game'

// POST /api/game/start
export interface StartGameRequest {
  betAmount: number
  mineCount: number
  rtp: RTPSetting
  lobbyToken?: string
  lobbySessionId?: string
}

export interface StartGameResponse {
  sessionId: string
  serverSeedHash: string
  multiplier: number
  nextMultiplier: number
  lobbyBalance?: number
}

// POST /api/game/pick
export interface PickTileRequest {
  sessionId: string
  tileIndex: number
}

export interface PickTileSafeResponse {
  result: 'safe'
  newMultiplier: number
  nextMultiplier: number
  pickedTiles: number[]
}

export interface PickTileFullClearResponse {
  result: 'safe'
  newMultiplier: number
  pickedTiles: number[]
  fullClear: true
  payout: number
  serverSeed: string
  minePositions: number[]
  newBalance?: number
}

export interface PickTileMineResponse {
  result: 'mine'
  serverSeed: string
  minePositions: number[]
  payout: 0
  newBalance?: number
}

export type PickTileResponse = PickTileSafeResponse | PickTileFullClearResponse | PickTileMineResponse

// POST /api/game/cashout
export interface CashoutRequest {
  sessionId: string
}

export interface CashoutResponse {
  payout: number
  finalMultiplier: number
  serverSeed: string
  minePositions: number[]
  newBalance?: number
}
