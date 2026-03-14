/**
 * Provably Fair — End-to-End Verification
 *
 * Simulates the full provably-fair flow that a player would verify:
 * 1. Receive serverSeedHash before the game starts
 * 2. Play the game
 * 3. Receive serverSeed after the game ends
 * 4. Verify: SHA256(serverSeed) === serverSeedHash
 * 5. Verify: generateMinePositions(serverSeed, clientSeed, mineCount) matches revealed positions
 */

import { describe, it, expect } from 'vitest'
import crypto from 'crypto'
import {
  generateServerSeed,
  hashServerSeed,
  generateMinePositions,
} from '../services/provably-fair.service'

describe('Provably Fair — E2E Verification', () => {
  it('full verification flow: hash commitment → reveal → verify', () => {
    // Phase 1: Server commits (before game)
    const serverSeed = generateServerSeed()
    const serverSeedHash = hashServerSeed(serverSeed)
    const clientSeed = 'default-client-seed'
    const mineCount = 5

    // Phase 2: Generate mine positions (hidden during game)
    const minePositions = generateMinePositions(serverSeed, clientSeed, mineCount)

    // Phase 3: Player verification (after game)
    // 3a. Verify hash matches
    const verifiedHash = crypto.createHash('sha256').update(serverSeed).digest('hex')
    expect(verifiedHash).toBe(serverSeedHash)

    // 3b. Verify mine positions are reproducible
    const verifiedPositions = generateMinePositions(serverSeed, clientSeed, mineCount)
    expect(verifiedPositions).toEqual(minePositions)

    // 3c. Basic sanity on positions
    expect(minePositions).toHaveLength(mineCount)
    minePositions.forEach((pos) => {
      expect(pos).toBeGreaterThanOrEqual(0)
      expect(pos).toBeLessThanOrEqual(24)
    })
    expect(new Set(minePositions).size).toBe(mineCount) // all unique
  })

  it('100 rounds: every round produces verifiable hash', () => {
    for (let i = 0; i < 100; i++) {
      const serverSeed = generateServerSeed()
      const hash = hashServerSeed(serverSeed)
      const recomputedHash = crypto.createHash('sha256').update(serverSeed).digest('hex')
      expect(recomputedHash).toBe(hash)
    }
  })

  it('different client seeds produce different mine positions', () => {
    const serverSeed = generateServerSeed()
    const posA = generateMinePositions(serverSeed, 'client-a', 5)
    const posB = generateMinePositions(serverSeed, 'client-b', 5)
    // Extremely unlikely to be equal with different seeds
    expect(posA).not.toEqual(posB)
  })

  it('mine position distribution covers the full board across many games', () => {
    const positionCounts = new Array(25).fill(0)
    const rounds = 1000

    for (let i = 0; i < rounds; i++) {
      const serverSeed = generateServerSeed()
      const positions = generateMinePositions(serverSeed, `client-${i}`, 5)
      positions.forEach((pos) => positionCounts[pos]++)
    }

    // With 1000 rounds × 5 mines = 5000 placements across 25 tiles,
    // each tile should appear ~200 times. Allow wide range for randomness.
    positionCounts.forEach((count, tile) => {
      expect(count).toBeGreaterThan(50) // no tile should be systematically avoided
      expect(count).toBeLessThan(500) // no tile should be systematically favored
    })
  })
})
