import type {
  RTPSetting,
  StartGameResponse,
  PickTileResponse,
  CashoutResponse,
} from '@mines-game/shared'
import { GameError } from '../middleware/error-handler'
import { generateId } from '../utils/id-generator'
import {
  generateServerSeed,
  hashServerSeed,
  generateMinePositions,
} from './provably-fair.service'
import { getMultiplier } from './rtp.service'
import {
  createSession,
  getSession,
  updateSession,
  deleteSession,
} from './session.service'
import { prisma } from '../db/prisma.client'

const DEFAULT_CLIENT_SEED = 'default-client-seed'

export async function startGame(
  betAmount: number,
  mineCount: number,
  rtp: RTPSetting,
): Promise<StartGameResponse> {
  const sessionId = generateId('SESS')
  const betId = generateId('BET')
  const serverSeed = generateServerSeed()
  const serverSeedHash = hashServerSeed(serverSeed)
  const clientSeed = DEFAULT_CLIENT_SEED
  const minePositions = generateMinePositions(serverSeed, clientSeed, mineCount)

  createSession({
    sessionId,
    betId,
    playerId: 'player-1', // Single-player for now
    betAmount,
    mineCount,
    rtp,
    serverSeed,
    serverSeedHash,
    clientSeed,
    minePositions,
    pickedTiles: [],
    currentMultiplier: 1.0,
    status: 'active',
  })

  await prisma.betRecord.create({
    data: {
      betId,
      sessionId,
      playerId: 'player-1',
      betAmount,
      mineCount,
      rtpSetting: rtp,
      status: 'ACTIVE',
      pickedTiles: [],
      currentMultiplier: 1.0,
      serverSeedHash,
    },
  })

  return { sessionId, serverSeedHash, multiplier: 1.0 }
}

export async function pickTile(
  sessionId: string,
  tileIndex: number,
): Promise<PickTileResponse> {
  const session = getSession(sessionId)
  if (!session) {
    throw new GameError(404, 'Session not found')
  }
  if (session.status !== 'active') {
    throw new GameError(400, 'Game is not active')
  }
  if (session.pickedTiles.includes(tileIndex)) {
    throw new GameError(400, 'Tile already picked')
  }

  const isMine = session.minePositions.includes(tileIndex)

  if (isMine) {
    // --- LOSE ---
    deleteSession(sessionId)

    await prisma.$transaction([
      prisma.betRecord.update({
        where: { sessionId },
        data: { status: 'SETTLED', pickedTiles: [...session.pickedTiles, tileIndex] },
      }),
      prisma.settlement.create({
        data: {
          betId: session.betId,
          outcome: 'LOSE',
          betAmount: session.betAmount,
          finalMultiplier: session.currentMultiplier,
          payout: 0,
          profit: -session.betAmount,
        },
      }),
      prisma.drawLog.create({
        data: {
          betId: session.betId,
          serverSeed: session.serverSeed,
          serverSeedHash: session.serverSeedHash,
          clientSeed: session.clientSeed,
          minePositions: session.minePositions,
          totalTiles: 25,
          mineCount: session.mineCount,
        },
      }),
    ])

    return {
      result: 'mine',
      serverSeed: session.serverSeed,
      minePositions: session.minePositions,
      payout: 0,
    }
  }

  // --- SAFE ---
  const newPickedTiles = [...session.pickedTiles, tileIndex]
  const newMultiplier = getMultiplier(session.mineCount, newPickedTiles.length, session.rtp)

  updateSession(sessionId, {
    pickedTiles: newPickedTiles,
    currentMultiplier: newMultiplier,
  })

  await prisma.betRecord.update({
    where: { sessionId },
    data: {
      pickedTiles: newPickedTiles,
      currentMultiplier: newMultiplier,
    },
  })

  return {
    result: 'safe',
    newMultiplier,
    pickedTiles: newPickedTiles,
  }
}

export async function cashout(sessionId: string): Promise<CashoutResponse> {
  const session = getSession(sessionId)
  if (!session) {
    throw new GameError(404, 'Session not found')
  }
  if (session.status !== 'active') {
    throw new GameError(400, 'Game is not active')
  }
  if (session.pickedTiles.length === 0) {
    throw new GameError(400, 'Must pick at least one tile before cashing out')
  }

  const payout = parseFloat((session.betAmount * session.currentMultiplier).toFixed(4))
  const profit = parseFloat((payout - session.betAmount).toFixed(4))

  deleteSession(sessionId)

  await prisma.$transaction([
    prisma.betRecord.update({
      where: { sessionId },
      data: { status: 'SETTLED' },
    }),
    prisma.settlement.create({
      data: {
        betId: session.betId,
        outcome: 'WIN',
        betAmount: session.betAmount,
        finalMultiplier: session.currentMultiplier,
        payout,
        profit,
      },
    }),
    prisma.drawLog.create({
      data: {
        betId: session.betId,
        serverSeed: session.serverSeed,
        serverSeedHash: session.serverSeedHash,
        clientSeed: session.clientSeed,
        minePositions: session.minePositions,
        totalTiles: 25,
        mineCount: session.mineCount,
      },
    }),
  ])

  return {
    payout,
    finalMultiplier: session.currentMultiplier,
    serverSeed: session.serverSeed,
    minePositions: session.minePositions,
  }
}
