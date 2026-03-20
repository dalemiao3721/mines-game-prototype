import type { RTPSetting, StartGameResponse, PickTileResponse, CashoutResponse } from '@mines-game/shared';
export declare function startGame(betAmount: number, mineCount: number, rtp: RTPSetting, lobbyToken?: string, lobbySessionId?: string): Promise<StartGameResponse>;
export declare function pickTile(sessionId: string, tileIndex: number): Promise<PickTileResponse>;
export declare function cashout(sessionId: string): Promise<CashoutResponse>;
//# sourceMappingURL=game.service.d.ts.map