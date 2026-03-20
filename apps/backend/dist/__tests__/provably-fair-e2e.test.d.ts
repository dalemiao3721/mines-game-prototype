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
export {};
//# sourceMappingURL=provably-fair-e2e.test.d.ts.map