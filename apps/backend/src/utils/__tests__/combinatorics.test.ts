import { describe, it, expect } from 'vitest'
import { combination, calcMultiplier } from '../combinatorics'

describe('combination(n, r)', () => {
  it('returns 1 for C(n, 0) and C(n, n)', () => {
    expect(combination(25, 0)).toBe(1n)
    expect(combination(25, 25)).toBe(1n)
  })

  it('returns 0 when r > n', () => {
    expect(combination(3, 5)).toBe(0n)
  })

  it('returns 0 when r < 0', () => {
    expect(combination(5, -1)).toBe(0n)
  })

  it('computes C(25, 5) = 53130', () => {
    expect(combination(25, 5)).toBe(53130n)
  })

  it('computes C(25, 1) = 25', () => {
    expect(combination(25, 1)).toBe(25n)
  })

  it('leverages symmetry: C(25, 20) = C(25, 5)', () => {
    expect(combination(25, 20)).toBe(combination(25, 5))
  })

  it('computes C(20, 5) = 15504', () => {
    expect(combination(20, 5)).toBe(15504n)
  })
})

describe('calcMultiplier(mineCount, openedTiles, rtp)', () => {
  it('returns 1.0 when no tiles opened', () => {
    expect(calcMultiplier(5, 0, 96)).toBe(1.0)
  })

  it('returns 0 when denominator is zero (impossible scenario)', () => {
    // 25 mines, try to open 1 tile — C(0, 1) = 0
    expect(calcMultiplier(25, 1, 96)).toBe(0)
  })

  // Verification against the RTP table in system-design.md (5 mines)
  it('calcMultiplier(5, 1, 96) ≈ 1.200', () => {
    // C(25,1)/C(20,1) = 25/20 = 1.25; × 0.96 = 1.2
    expect(calcMultiplier(5, 1, 96)).toBeCloseTo(1.2, 3)
  })

  it('calcMultiplier(5, 5, 99) ≈ 3.393', () => {
    // C(25,5)/C(20,5) = 53130/15504 ≈ 3.4268; × 0.99 ≈ 3.3926
    expect(calcMultiplier(5, 5, 99)).toBeCloseTo(3.393, 2)
  })

  it('calcMultiplier(5, 1, 99) ≈ 1.238', () => {
    expect(calcMultiplier(5, 1, 99)).toBeCloseTo(1.2375, 3)
  })

  it('calcMultiplier(5, 3, 97) ≈ 1.957', () => {
    // C(25,3)/C(20,3) = 2300/1140 ≈ 2.0175; × 0.97 ≈ 1.957
    expect(calcMultiplier(5, 3, 97)).toBeCloseTo(1.957, 2)
  })

  // Edge case: 1 mine
  it('calcMultiplier(1, 1, 100) ≈ 1.0417', () => {
    // C(25,1)/C(24,1) = 25/24 ≈ 1.04167
    expect(calcMultiplier(1, 1, 100)).toBeCloseTo(1.0417, 3)
  })

  // Edge case: 24 mines, open 1 tile
  it('calcMultiplier(24, 1, 96) = 24.0', () => {
    // C(25,1)/C(1,1) = 25/1 = 25; × 0.96 = 24.0
    expect(calcMultiplier(24, 1, 96)).toBe(24.0)
  })
})
