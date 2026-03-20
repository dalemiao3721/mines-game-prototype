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
export {};
//# sourceMappingURL=rtp-simulation.test.d.ts.map