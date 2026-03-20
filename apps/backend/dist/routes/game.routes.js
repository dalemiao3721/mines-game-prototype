import { Router } from 'express';
import { handleStartGame, handlePickTile, handleCashout, } from '../controllers/game.controller';
import { validateStartGame, validatePickTile, validateCashout, } from '../middleware/validate';
const router = Router();
router.post('/start', validateStartGame, handleStartGame);
router.post('/pick', validatePickTile, handlePickTile);
router.post('/cashout', validateCashout, handleCashout);
export default router;
//# sourceMappingURL=game.routes.js.map