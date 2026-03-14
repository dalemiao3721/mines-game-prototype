import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma before importing game.service
vi.mock('../../db/prisma.client', () => ({
  prisma: {
    betRecord: {
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    },
    settlement: { create: vi.fn().mockResolvedValue({}) },
    drawLog: { create: vi.fn().mockResolvedValue({}) },
    $transaction: vi.fn().mockResolvedValue([]),
  },
}))

import { startGame, pickTile, cashout } from '../game.service'
import { getSession } from '../session.service'

describe('game.service', () => {
  describe('startGame', () => {
    it('returns sessionId, serverSeedHash, and multiplier 1.0', async () => {
      const result = await startGame(100, 5, 96)
      expect(result.sessionId).toMatch(/^SESS-/)
      expect(result.serverSeedHash).toMatch(/^[0-9a-f]{64}$/)
      expect(result.multiplier).toBe(1.0)
    })

    it('creates an active session in memory', async () => {
      const result = await startGame(50, 3, 99)
      const session = getSession(result.sessionId)
      expect(session).toBeDefined()
      expect(session!.status).toBe('active')
      expect(session!.betAmount).toBe(50)
      expect(session!.mineCount).toBe(3)
      expect(session!.rtp).toBe(99)
      expect(session!.pickedTiles).toEqual([])
      expect(session!.minePositions).toHaveLength(3)
    })
  })

  describe('pickTile', () => {
    it('throws 404 for nonexistent session', async () => {
      await expect(pickTile('bad-id', 0)).rejects.toThrow('Session not found')
    })

    it('throws 400 for already-picked tile', async () => {
      const { sessionId } = await startGame(100, 5, 96)
      const session = getSession(sessionId)!

      // Pick a tile that is NOT a mine
      const safeTile = Array.from({ length: 25 }, (_, i) => i).find(
        (i) => !session.minePositions.includes(i),
      )!

      await pickTile(sessionId, safeTile)
      await expect(pickTile(sessionId, safeTile)).rejects.toThrow('Tile already picked')
    })

    it('returns "safe" result for non-mine tile', async () => {
      const { sessionId } = await startGame(100, 5, 96)
      const session = getSession(sessionId)!

      const safeTile = Array.from({ length: 25 }, (_, i) => i).find(
        (i) => !session.minePositions.includes(i),
      )!

      const result = await pickTile(sessionId, safeTile)
      expect(result.result).toBe('safe')
      if (result.result === 'safe') {
        expect(result.newMultiplier).toBeGreaterThan(1.0)
        expect(result.pickedTiles).toContain(safeTile)
      }
    })

    it('returns "mine" result and reveals seed for mine tile', async () => {
      const { sessionId } = await startGame(100, 5, 96)
      const session = getSession(sessionId)!
      const mineTile = session.minePositions[0]

      const result = await pickTile(sessionId, mineTile)
      expect(result.result).toBe('mine')
      if (result.result === 'mine') {
        expect(result.payout).toBe(0)
        expect(result.serverSeed).toBe(session.serverSeed)
        expect(result.minePositions).toEqual(session.minePositions)
      }
    })

    it('deletes session after hitting a mine', async () => {
      const { sessionId } = await startGame(100, 5, 96)
      const session = getSession(sessionId)!
      await pickTile(sessionId, session.minePositions[0])
      expect(getSession(sessionId)).toBeUndefined()
    })
  })

  describe('cashout', () => {
    it('throws 404 for nonexistent session', async () => {
      await expect(cashout('bad-id')).rejects.toThrow('Session not found')
    })

    it('throws 400 when no tiles picked', async () => {
      const { sessionId } = await startGame(100, 5, 96)
      await expect(cashout(sessionId)).rejects.toThrow('Must pick at least one tile')
    })

    it('returns payout, multiplier, and reveals seed', async () => {
      const { sessionId } = await startGame(100, 5, 96)
      const session = getSession(sessionId)!

      // Pick one safe tile
      const safeTile = Array.from({ length: 25 }, (_, i) => i).find(
        (i) => !session.minePositions.includes(i),
      )!
      await pickTile(sessionId, safeTile)

      const result = await cashout(sessionId)
      expect(result.payout).toBeGreaterThan(0)
      expect(result.finalMultiplier).toBeGreaterThan(1.0)
      expect(result.serverSeed).toBe(session.serverSeed)
      expect(result.minePositions).toEqual(session.minePositions)
    })

    it('deletes session after cashout', async () => {
      const { sessionId } = await startGame(100, 5, 96)
      const session = getSession(sessionId)!
      const safeTile = Array.from({ length: 25 }, (_, i) => i).find(
        (i) => !session.minePositions.includes(i),
      )!
      await pickTile(sessionId, safeTile)
      await cashout(sessionId)
      expect(getSession(sessionId)).toBeUndefined()
    })
  })
})
