import { describe, it, expect } from 'vitest'
import { generateId } from '../id-generator'

describe('generateId', () => {
  it('generates IDs with correct prefix', () => {
    expect(generateId('BET')).toMatch(/^BET-/)
    expect(generateId('SESS')).toMatch(/^SESS-/)
    expect(generateId('SET')).toMatch(/^SET-/)
    expect(generateId('DRAW')).toMatch(/^DRAW-/)
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId('BET')))
    expect(ids.size).toBe(100)
  })

  it('has expected format: PREFIX-timestamp-random', () => {
    const id = generateId('BET')
    const parts = id.split('-')
    expect(parts.length).toBe(3)
    expect(parts[0]).toBe('BET')
    // timestamp part is base36
    expect(parts[1]).toMatch(/^[0-9a-z]+$/)
    // random part is hex
    expect(parts[2]).toMatch(/^[0-9a-f]{24}$/)
  })
})
