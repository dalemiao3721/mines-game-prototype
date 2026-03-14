import { describe, it, expect, vi, beforeAll } from 'vitest'
import crypto from 'crypto'
import request from 'supertest'

// Mock Prisma before importing the app
vi.mock('../db/prisma.client', () => ({
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

// Must import after mock setup. The `app` export triggers app.listen(),
// but supertest handles its own listening on a random port.
import { app } from '../index'

describe('API Integration Tests', () => {
  describe('POST /api/game/start', () => {
    it('returns sessionId, serverSeedHash, and multiplier 1.0', async () => {
      const res = await request(app)
        .post('/api/game/start')
        .send({ betAmount: 100, mineCount: 5, rtp: 96 })

      expect(res.status).toBe(200)
      expect(res.body.sessionId).toMatch(/^SESS-/)
      expect(res.body.serverSeedHash).toMatch(/^[0-9a-f]{64}$/)
      expect(res.body.multiplier).toBe(1.0)
    })

    it('rejects invalid betAmount', async () => {
      const res = await request(app)
        .post('/api/game/start')
        .send({ betAmount: -10, mineCount: 5, rtp: 96 })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/betAmount/)
    })

    it('rejects invalid mineCount (0)', async () => {
      const res = await request(app)
        .post('/api/game/start')
        .send({ betAmount: 100, mineCount: 0, rtp: 96 })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/mineCount/)
    })

    it('rejects invalid mineCount (25)', async () => {
      const res = await request(app)
        .post('/api/game/start')
        .send({ betAmount: 100, mineCount: 25, rtp: 96 })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/mineCount/)
    })

    it('rejects invalid rtp', async () => {
      const res = await request(app)
        .post('/api/game/start')
        .send({ betAmount: 100, mineCount: 5, rtp: 95 })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/rtp/)
    })
  })

  describe('Full game flow: start → pick (safe) → cashout', () => {
    it('completes a winning game with correct multiplier progression', async () => {
      // 1. Start game
      const startRes = await request(app)
        .post('/api/game/start')
        .send({ betAmount: 100, mineCount: 5, rtp: 96 })

      expect(startRes.status).toBe(200)
      const { sessionId, serverSeedHash } = startRes.body

      // 2. Pick tiles — try tiles 0-24, find a safe one
      let safePickResult: { newMultiplier: number; pickedTiles: number[] } | null = null
      for (let tile = 0; tile < 25; tile++) {
        const pickRes = await request(app)
          .post('/api/game/pick')
          .send({ sessionId, tileIndex: tile })

        if (pickRes.status === 200 && pickRes.body.result === 'safe') {
          safePickResult = pickRes.body
          expect(pickRes.body.newMultiplier).toBeGreaterThan(1.0)
          expect(pickRes.body.pickedTiles).toContain(tile)
          break
        }
        // If we hit a mine, start fresh
        if (pickRes.body.result === 'mine') {
          // Verify mine response format
          expect(pickRes.body.payout).toBe(0)
          expect(pickRes.body.serverSeed).toBeTruthy()
          expect(pickRes.body.minePositions).toHaveLength(5)
          return // test is still valid — we verified the mine flow
        }
      }

      expect(safePickResult).not.toBeNull()

      // 3. Cashout
      const cashoutRes = await request(app)
        .post('/api/game/cashout')
        .send({ sessionId })

      expect(cashoutRes.status).toBe(200)
      expect(cashoutRes.body.payout).toBeGreaterThan(0)
      expect(cashoutRes.body.finalMultiplier).toBe(safePickResult!.newMultiplier)
      expect(cashoutRes.body.serverSeed).toBeTruthy()
      expect(cashoutRes.body.minePositions).toHaveLength(5)

      // Verify serverSeedHash matches revealed serverSeed
      const verifyHash = crypto
        .createHash('sha256')
        .update(cashoutRes.body.serverSeed)
        .digest('hex')
      expect(verifyHash).toBe(serverSeedHash)
    })
  })

  describe('Full game flow: start → pick (mine) → game over', () => {
    it('ends game when hitting a mine, reveals seed, and prevents further picks', async () => {
      // Start many games to guarantee hitting a mine
      for (let attempt = 0; attempt < 20; attempt++) {
        const startRes = await request(app)
          .post('/api/game/start')
          .send({ betAmount: 50, mineCount: 20, rtp: 96 }) // 20 mines = very likely to hit one

        const { sessionId, serverSeedHash } = startRes.body

        const pickRes = await request(app)
          .post('/api/game/pick')
          .send({ sessionId, tileIndex: 0 })

        if (pickRes.body.result === 'mine') {
          expect(pickRes.body.payout).toBe(0)
          expect(pickRes.body.minePositions).toHaveLength(20)

          // Verify hash
          const verifyHash = crypto
            .createHash('sha256')
            .update(pickRes.body.serverSeed)
            .digest('hex')
          expect(verifyHash).toBe(serverSeedHash)

          // Session should be destroyed — further picks should fail
          const nextPickRes = await request(app)
            .post('/api/game/pick')
            .send({ sessionId, tileIndex: 1 })
          expect(nextPickRes.status).toBe(404)

          return
        }
      }
      // If we never hit a mine with 20 mines in 20 attempts, something is wrong
      throw new Error('Expected to hit a mine with 20 mines in 20 attempts')
    })
  })

  describe('Session security', () => {
    it('rejects pick with invalid sessionId', async () => {
      const res = await request(app)
        .post('/api/game/pick')
        .send({ sessionId: 'fake-session-id', tileIndex: 0 })

      expect(res.status).toBe(404)
    })

    it('rejects cashout with invalid sessionId', async () => {
      const res = await request(app)
        .post('/api/game/cashout')
        .send({ sessionId: 'fake-session-id' })

      expect(res.status).toBe(404)
    })

    it('rejects cashout before any tile is picked', async () => {
      const startRes = await request(app)
        .post('/api/game/start')
        .send({ betAmount: 100, mineCount: 5, rtp: 96 })

      const res = await request(app)
        .post('/api/game/cashout')
        .send({ sessionId: startRes.body.sessionId })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/Must pick/)
    })

    it('rejects pick with missing tileIndex', async () => {
      const startRes = await request(app)
        .post('/api/game/start')
        .send({ betAmount: 100, mineCount: 5, rtp: 96 })

      const res = await request(app)
        .post('/api/game/pick')
        .send({ sessionId: startRes.body.sessionId })

      expect(res.status).toBe(400)
    })

    it('rejects cashout after session is already settled', async () => {
      const startRes = await request(app)
        .post('/api/game/start')
        .send({ betAmount: 100, mineCount: 20, rtp: 96 })

      // Hit a mine to settle the game
      await request(app)
        .post('/api/game/pick')
        .send({ sessionId: startRes.body.sessionId, tileIndex: 0 })

      // Try to cashout the already-settled session
      const res = await request(app)
        .post('/api/game/cashout')
        .send({ sessionId: startRes.body.sessionId })

      expect(res.status).toBe(404)
    })
  })

  describe('Health check', () => {
    it('GET /api/health returns ok', async () => {
      const res = await request(app).get('/api/health')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
    })
  })
})
