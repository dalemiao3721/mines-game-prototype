/**
 * Combinatorics utilities for mine game multiplier calculation.
 *
 * Core formula: Multiplier = (RTP / 100) × C(25, d) / C(25 - m, d)
 * where m = mine count, d = opened safe tiles.
 */
export declare function combination(n: number, r: number): bigint;
export declare function calcMultiplier(mineCount: number, openedTiles: number, rtp: number): number;
//# sourceMappingURL=combinatorics.d.ts.map