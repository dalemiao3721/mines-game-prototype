export function combination(n: number, r: number): bigint {
  if (r < 0 || r > n) return 0n
  if (r === 0 || r === n) return 1n
  r = Math.min(r, n - r)
  let result = 1n
  for (let i = 0; i < r; i++) {
    result = (result * BigInt(n - i)) / BigInt(i + 1)
  }
  return result
}

export function calcMultiplier(
  mineCount: number,
  openedTiles: number,
  rtp: number,
): number {
  if (openedTiles === 0) return 1.0

  const totalTiles = 25
  const numerator = combination(totalTiles, openedTiles)
  const denominator = combination(totalTiles - mineCount, openedTiles)

  if (denominator === 0n) return 0

  const fairMultiplier = Number(numerator) / Number(denominator)
  return parseFloat((fairMultiplier * (rtp / 100)).toFixed(4))
}
