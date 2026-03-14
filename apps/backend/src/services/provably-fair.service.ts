import crypto from 'crypto'

export function generateServerSeed(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashServerSeed(serverSeed: string): string {
  return crypto.createHash('sha256').update(serverSeed).digest('hex')
}

export function generateMinePositions(
  serverSeed: string,
  clientSeed: string,
  mineCount: number,
): number[] {
  const combined = `${serverSeed}:${clientSeed}`
  const hash = crypto.createHash('sha256').update(combined).digest('hex')

  // Fisher-Yates shuffle using deterministic bytes from the hash
  const tiles = Array.from({ length: 25 }, (_, i) => i)
  for (let i = tiles.length - 1; i > 0; i--) {
    const byteIndex = (i * 2) % hash.length
    const randomByte = parseInt(hash.slice(byteIndex, byteIndex + 2), 16)
    const j = randomByte % (i + 1)
    ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
  }

  return tiles.slice(0, mineCount).sort((a, b) => a - b)
}
