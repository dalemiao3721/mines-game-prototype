import { describe, it, expect } from 'vitest'
import {
  generateServerSeed,
  hashServerSeed,
  generateMinePositions,
} from '../provably-fair.service'

describe('provably-fair.service', () => {
  describe('generateServerSeed', () => {
    it('returns a 64-character hex string', () => {
      const seed = generateServerSeed()
      expect(seed).toMatch(/^[0-9a-f]{64}$/)
    })

    it('generates unique seeds', () => {
      const seeds = new Set(Array.from({ length: 50 }, () => generateServerSeed()))
      expect(seeds.size).toBe(50)
    })
  })

  describe('hashServerSeed', () => {
    it('returns a 64-character hex string (SHA256)', () => {
      const hash = hashServerSeed('test-seed')
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })

    it('is deterministic', () => {
      const seed = 'my-fixed-seed'
      expect(hashServerSeed(seed)).toBe(hashServerSeed(seed))
    })

    it('differs for different seeds', () => {
      expect(hashServerSeed('seed-a')).not.toBe(hashServerSeed('seed-b'))
    })
  })

  describe('generateMinePositions', () => {
    it('returns the correct number of mines', () => {
      const positions = generateMinePositions('server', 'client', 5)
      expect(positions).toHaveLength(5)
    })

    it('returns positions in range [0, 24]', () => {
      const positions = generateMinePositions('server', 'client', 10)
      positions.forEach((pos) => {
        expect(pos).toBeGreaterThanOrEqual(0)
        expect(pos).toBeLessThanOrEqual(24)
      })
    })

    it('returns sorted, unique positions', () => {
      const positions = generateMinePositions('server', 'client', 12)
      const unique = [...new Set(positions)]
      expect(unique).toHaveLength(positions.length)
      expect(positions).toEqual([...positions].sort((a, b) => a - b))
    })

    it('is deterministic (same seeds → same positions)', () => {
      const a = generateMinePositions('seed1', 'seed2', 5)
      const b = generateMinePositions('seed1', 'seed2', 5)
      expect(a).toEqual(b)
    })

    it('differs with different server seeds', () => {
      const a = generateMinePositions('seed-a', 'client', 5)
      const b = generateMinePositions('seed-b', 'client', 5)
      expect(a).not.toEqual(b)
    })

    it('handles edge case: 1 mine', () => {
      const positions = generateMinePositions('server', 'client', 1)
      expect(positions).toHaveLength(1)
    })

    it('handles edge case: 24 mines', () => {
      const positions = generateMinePositions('server', 'client', 24)
      expect(positions).toHaveLength(24)
      // All unique positions from 0-24, one missing
      const missing = Array.from({ length: 25 }, (_, i) => i).filter(
        (i) => !positions.includes(i),
      )
      expect(missing).toHaveLength(1)
    })
  })
})
