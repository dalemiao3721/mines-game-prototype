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
import * as lobbyClient from './lobby-client'

const DEFAULT_CLIENT_SEED = 'default-client-seed'

/**
 * Helper: settle with lobby. Errors are logged but do not block the game.
 * Returns newBalance if available.
 */
async function settleWithLobby(
  lobbySessionId: string | undefined,
  betAmount: number,
  payout: number,
  betId: string,
): Promise<number | undefined> {
  if (!lobbySessionId) return undefined
  try {
    const result = await lobbyClient.settle(lobbySessionId, betAmount, payout)
    return result.newBalance
  } catch (err) {
    console.error(`Lobby settle failed for bet ${betId}:`, err)
    return undefined
  }
}

export async function startGame(
  betAmount: number,
  mineCount: number,
  rtp: RTPSetting,
  lobbyToken?: string,
  lobbySessionId?: string,
): Promise<StartGameResponse> {
  const sessionId = generateId('SESS')
  const betId = generateId('BET')
  const serverSeed = generateServerSeed()
  const serverSeedHash = hashServerSeed(serverSeed)
  const clientSeed = DEFAULT_CLIENT_SEED
  const minePositions = generateMinePositions(serverSeed, clientSeed, mineCount)

  // --- LOBBY INTEGRATION: Deduct bet at start ---
  let lobbyBalance: number | undefined
  if (lobbyToken && lobbySessionId) {
    try {
      // Check balance first
      const balanceRes = await lobbyClient.getBalance(lobbyToken)
      if (balanceRes.balance < betAmount) {
        throw new GameError(400, `Insufficient balance: ${balanceRes.balance} < ${betAmount}`)
      }
      // Deduct bet immediately (betAmount deducted, payout=0)
      const settleRes = await lobbyClient.settle(lobbySessionId, betAmount, 0)
      lobbyBalance = settleRes.newBalance
    } catch (err) {
      if (err instanceof GameError) throw err
      console.error('Lobby deduct bet failed:', err)
      throw new GameError(500, 'Unable to deduct bet from lobby')
    }
  }

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
    lobbySessionId,
    lobbyToken,
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

  const nextMultiplier = getMultiplier(mineCount, 1, rtp)

  return { sessionId, serverSeedHash, multiplier: 1.0, nextMultiplier, lobbyBalance }
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

    // Bet already deducted at start — no settle needed on loss
    // Just fetch current balance for UI update
    let newBalance: number | undefined
    if (session.lobbyToken) {
      try {
        const b = await lobbyClient.getBalance(session.lobbyToken)
        newBalance = b.balance
      } catch { /* ignore */ }
    }

    return {
      result: 'mine',
      serverSeed: session.serverSeed,
      minePositions: session.minePositions,
      payout: 0,
      newBalance,
    }
  }

  // --- SAFE ---
  const newPickedTiles = [...session.pickedTiles, tileIndex]
  const newMultiplier = getMultiplier(session.mineCount, newPickedTiles.length, session.rtp)
  const isFullClear = newPickedTiles.length === 25 - session.mineCount

  if (isFullClear) {
    // Auto-cashout: player revealed all safe tiles
    const payout = parseFloat((session.betAmount * newMultiplier).toFixed(4))
    const profit = parseFloat((payout - session.betAmount).toFixed(4))

    deleteSession(sessionId)

    await prisma.$transaction([
      prisma.betRecord.update({
        where: { sessionId },
        data: { status: 'SETTLED', pickedTiles: newPickedTiles, currentMultiplier: newMultiplier },
      }),
      prisma.settlement.create({
        data: {
          betId: session.betId,
          outcome: 'WIN',
          betAmount: session.betAmount,
          finalMultiplier: newMultiplier,
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

    // --- LOBBY INTEGRATION: Add payout only (bet already deducted at start) ---
    const newBalance = await settleWithLobby(
      session.lobbySessionId,
      0,
      payout,
      session.betId,
    )

    return {
      result: 'safe' as const,
      newMultiplier,
      pickedTiles: newPickedTiles,
      fullClear: true as const,
      payout,
      serverSeed: session.serverSeed,
      minePositions: session.minePositions,
      newBalance,
    }
  }

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

  const nextMultiplier = getMultiplier(session.mineCount, newPickedTiles.length + 1, session.rtp)

  return {
    result: 'safe',
    newMultiplier,
    nextMultiplier,
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

  // --- LOBBY INTEGRATION: Add payout only (bet already deducted at start) ---
  const newBalance = await settleWithLobby(
    session.lobbySessionId,
    0,
    payout,
    session.betId,
  )

  return {
    payout,
    finalMultiplier: session.currentMultiplier,
    serverSeed: session.serverSeed,
    minePositions: session.minePositions,
    newBalance,
  }
}
