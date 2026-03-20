import type { GameSession } from '@mines-game/shared';
export declare function createSession(session: GameSession): void;
export declare function getSession(sessionId: string): GameSession | undefined;
export declare function updateSession(sessionId: string, updates: Partial<GameSession>): GameSession;
export declare function deleteSession(sessionId: string): boolean;
//# sourceMappingURL=session.service.d.ts.map