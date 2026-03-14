export enum BetStatus {
  ACTIVE = 'ACTIVE',
  SETTLED = 'SETTLED',
}

export enum Outcome {
  WIN = 'WIN',
  LOSE = 'LOSE',
}

export interface BetRecord {
  betId: string
  sessionId: string
  playerId: string
  betAmount: number
  mineCount: number
  rtpSetting: number
  status: BetStatus
  pickedTiles: number[]
  currentMultiplier: number
  serverSeedHash: string
  createdAt: Date
  updatedAt: Date
}

export interface Settlement {
  settlementId: string
  betId: string
  outcome: Outcome
  betAmount: number
  finalMultiplier: number
  payout: number
  profit: number
  settledAt: Date
}

export interface DrawLog {
  drawId: string
  betId: string
  serverSeed: string
  serverSeedHash: string
  clientSeed: string | null
  minePositions: number[]
  totalTiles: number
  mineCount: number
  revealedAt: Date
}
