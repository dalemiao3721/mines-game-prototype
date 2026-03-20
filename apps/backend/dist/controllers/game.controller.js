import { startGame, pickTile, cashout } from '../services/game.service';
export async function handleStartGame(req, res, next) {
    try {
        const { betAmount, mineCount, rtp, lobbyToken, lobbySessionId } = req.body;
        const result = await startGame(betAmount, mineCount, rtp, lobbyToken, lobbySessionId);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
export async function handlePickTile(req, res, next) {
    try {
        const { sessionId, tileIndex } = req.body;
        const result = await pickTile(sessionId, tileIndex);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
export async function handleCashout(req, res, next) {
    try {
        const { sessionId } = req.body;
        const result = await cashout(sessionId);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=game.controller.js.map