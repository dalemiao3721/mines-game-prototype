/**
 * RTP (Return To Player) Simulation Verification
 *
 * Two-part verification:
 *   Part 1 — Analytical: For every valid (mineCount, openedTiles) combo,
 *            verify E[payout] = RTP × bet using exact probability math.
 *   Part 2 — Monte Carlo: Simulate random "conservative player" behavior
 *            (m=1..10, d=1..5) across 100k rounds per RTP setting and
 *            verify the actual return is within 0.5% of the target RTP.
 */

import { describe, it, expect } from 'vitest'
import { calcMultiplier, combination } from '../utils/combinatorics'

const RTP_VALUES = [94, 96, 97, 98, 99] as const
const TOTAL_TILES = 25
const BET_AMOUNT = 100

// ────────────────────────────────────────────────────────────────
// Part 1: Analytical Verification
// E[payout | m, d] = P(survive d tiles) × multiplier × bet
// This should always equal RTP/100 × bet (by construction of the formula)
// ────────────────────────────────────────────────────────────────

function analyticalExpectedPayout(m: number, d: number, rtp: number): number {
  const pSurvive =
    Number(combination(TOTAL_TILES - m, d)) /
    Number(combination(TOTAL_TILES, d))
  const multiplier = calcMultiplier(m, d, rtp)
  return pSurvive * BET_AMOUNT * multiplier
}

describe('RTP Analytical Verification', () => {
  for (const rtp of RTP_VALUES) {
    it(`RTP ${rtp}%: E[payout] = ${rtp}% × bet for ALL (m,d) combos`, () => {
      const expected = BET_AMOUNT * (rtp / 100)
      let maxErrorPct = 0
      let testedCases = 0

      for (let m = 1; m < TOTAL_TILES; m++) {
        const maxD = TOTAL_TILES - m
        for (let d = 1; d <= maxD; d++) {
          const payout = analyticalExpectedPayout(m, d, rtp)
          const errorPct = (Math.abs(payout - expected) / expected) * 100
          if (errorPct > maxErrorPct) maxErrorPct = errorPct
          testedCases++
        }
      }

      // Floating-point precision should keep error under 0.01%
      expect(maxErrorPct).toBeLessThan(0.01)
      expect(testedCases).toBeGreaterThan(200) // sanity: there are 300 valid combos
    })
  }
})

// ────────────────────────────────────────────────────────────────
// Part 2: Monte Carlo Simulation
// Simulates a "conservative player" who picks 1-5 tiles with 1-10 mines
// ────────────────────────────────────────────────────────────────

function simulateOneGame(mineCount: number, targetOpen: number, rtp: number): number {
  // Build a deck: 1 = mine, 0 = safe
  const deck = Array.from({ length: TOTAL_TILES }, (_, i) => (i < mineCount ? 1 : 0))
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  // Player picks the first `targetOpen` tiles in the shuffled deck
  for (let i = 0; i < targetOpen; i++) {
    if (deck[i] === 1) return 0 // hit a mine → lose bet
  }
  // Survived → cashout
  return BET_AMOUNT * calcMultiplier(mineCount, targetOpen, rtp)
}

const SIMULATIONS = 500_000
const MAX_MINES = 10
const MAX_D = 5

describe('RTP Monte Carlo Simulation (500k rounds per RTP)', () => {
  for (const rtp of RTP_VALUES) {
    it(`RTP ${rtp}%: actual return within 0.5% of target`, () => {
      let totalBet = 0
      let totalPayout = 0

      for (let i = 0; i < SIMULATIONS; i++) {
        const m = Math.floor(Math.random() * MAX_MINES) + 1 // 1..10
        const maxD = Math.min(MAX_D, TOTAL_TILES - m)
        const d = Math.floor(Math.random() * maxD) + 1 // 1..maxD

        totalBet += BET_AMOUNT
        totalPayout += simulateOneGame(m, d, rtp)
      }

      const actualRTP = (totalPayout / totalBet) * 100
      const error = Math.abs(actualRTP - rtp)

      // With 100k simulations and conservative parameters, error < 0.5% is expected
      expect(error).toBeLessThan(0.5)
    })
  }
})

// ────────────────────────────────────────────────────────────────
// Part 3: Multiplier table spot-check against system-design.md
// ────────────────────────────────────────────────────────────────

describe('Multiplier table verification (5 mines)', () => {
  const expected: Record<number, Record<number, number>> = {
    // d: { rtp: expected_multiplier }
    1: { 99: 1.238, 98: 1.225, 97: 1.213, 96: 1.2, 94: 1.175 },
    2: { 99: 1.563, 98: 1.547, 97: 1.531, 96: 1.516, 94: 1.484 },
    3: { 99: 1.997, 98: 1.977, 97: 1.957, 96: 1.937, 94: 1.896 },
    4: { 99: 2.585, 98: 2.559, 97: 2.532, 96: 2.506, 94: 2.454 },
    5: { 99: 3.393, 98: 3.358, 97: 3.324, 96: 3.29, 94: 3.221 },
  }

  for (const [d, rtpMap] of Object.entries(expected)) {
    for (const [rtp, expectedMultiplier] of Object.entries(rtpMap)) {
      it(`d=${d}, m=5, RTP=${rtp}% → ${expectedMultiplier}x`, () => {
        const actual = calcMultiplier(5, Number(d), Number(rtp))
        expect(actual).toBeCloseTo(expectedMultiplier, 2)
      })
    }
  }
})
