export type TileState = 'unrevealed' | 'safe' | 'mine'

export type GameStatus = 'idle' | 'active' | 'win' | 'lose'

export type RTPSetting = 94 | 96 | 97 | 98 | 99

export interface GameSession {
  sessionId: string
  betId: string
  playerId: string
  betAmount: number
  mineCount: number
  rtp: RTPSetting
  serverSeed: string
  serverSeedHash: string
  clientSeed: string
  minePositions: number[]
  pickedTiles: number[]
  currentMultiplier: number
  status: GameStatus
}
