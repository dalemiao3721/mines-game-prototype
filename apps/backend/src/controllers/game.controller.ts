import type { Request, Response, NextFunction } from 'express'
import type {
  StartGameRequest,
  PickTileRequest,
  CashoutRequest,
} from '@mines-game/shared'
import { startGame, pickTile, cashout } from '../services/game.service'

export async function handleStartGame(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { betAmount, mineCount, rtp } = req.body as StartGameRequest
    const result = await startGame(betAmount, mineCount, rtp)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function handlePickTile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { sessionId, tileIndex } = req.body as PickTileRequest
    const result = await pickTile(sessionId, tileIndex)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function handleCashout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { sessionId } = req.body as CashoutRequest
    const result = await cashout(sessionId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
