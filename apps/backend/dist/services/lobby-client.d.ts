/**
 * HTTP client for communicating with the game lobby backend.
 * Uses environment variables LOBBY_API_URL and GAME_SECRET.
 */
export interface LobbyBalanceResponse {
    balance: number;
    currency: string;
}
export interface LobbySettleResponse {
    success: boolean;
    newBalance: number;
}
export interface LobbyCloseSessionResponse {
    success: boolean;
}
/**
 * Get player balance from the lobby.
 * Uses the game-session-token (Bearer auth).
 */
export declare function getBalance(lobbyToken: string): Promise<LobbyBalanceResponse>;
/**
 * Settle a game round with the lobby (deduct bet / pay winnings).
 * Uses the shared game secret for authentication.
 */
export declare function settle(sessionId: string, betAmount: number, payout: number): Promise<LobbySettleResponse>;
/**
 * Close a game session in the lobby.
 * Uses the shared game secret for authentication.
 */
export declare function closeSession(sessionId: string): Promise<LobbyCloseSessionResponse>;
//# sourceMappingURL=lobby-client.d.ts.map