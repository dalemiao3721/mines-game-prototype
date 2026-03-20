import { describe, it, expect, beforeEach } from 'vitest';
import { createSession, getSession, updateSession, deleteSession, } from '../session.service';
function makeSession(overrides = {}) {
    return {
        sessionId: 'SESS-test-001',
        betId: 'BET-test-001',
        playerId: 'player-1',
        betAmount: 100,
        mineCount: 5,
        rtp: 96,
        serverSeed: 'server-seed',
        serverSeedHash: 'hash',
        clientSeed: 'client-seed',
        minePositions: [0, 5, 10, 15, 20],
        pickedTiles: [],
        currentMultiplier: 1.0,
        status: 'active',
        ...overrides,
    };
}
describe('session.service', () => {
    // Clear sessions between tests by creating/deleting
    beforeEach(() => {
        deleteSession('SESS-test-001');
        deleteSession('SESS-test-002');
    });
    it('createSession + getSession', () => {
        const session = makeSession();
        createSession(session);
        expect(getSession('SESS-test-001')).toEqual(session);
    });
    it('getSession returns undefined for missing session', () => {
        expect(getSession('nonexistent')).toBeUndefined();
    });
    it('updateSession merges partial updates', () => {
        createSession(makeSession());
        const updated = updateSession('SESS-test-001', {
            pickedTiles: [3],
            currentMultiplier: 1.2,
        });
        expect(updated.pickedTiles).toEqual([3]);
        expect(updated.currentMultiplier).toBe(1.2);
        expect(updated.betAmount).toBe(100); // unchanged
    });
    it('updateSession throws for missing session', () => {
        expect(() => updateSession('nonexistent', {})).toThrow('Session not found');
    });
    it('deleteSession removes and returns true', () => {
        createSession(makeSession());
        expect(deleteSession('SESS-test-001')).toBe(true);
        expect(getSession('SESS-test-001')).toBeUndefined();
    });
    it('deleteSession returns false for missing session', () => {
        expect(deleteSession('nonexistent')).toBe(false);
    });
});
//# sourceMappingURL=session.test.js.map