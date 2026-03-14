import type { Request, Response, NextFunction } from 'express'
import { isValidRTP, MIN_MINES, MAX_MINES, TOTAL_TILES } from '../config/rtp.config'

export function validateStartGame(req: Request, res: Response, next: NextFunction): void {
  const { betAmount, mineCount, rtp } = req.body

  if (typeof betAmount !== 'number' || betAmount <= 0) {
    res.status(400).json({ error: 'betAmount must be a positive number' })
    return
  }

  if (!Number.isInteger(mineCount) || mineCount < MIN_MINES || mineCount > MAX_MINES) {
    res.status(400).json({ error: `mineCount must be an integer between ${MIN_MINES} and ${MAX_MINES}` })
    return
  }

  if (!isValidRTP(rtp)) {
    res.status(400).json({ error: 'rtp must be one of: 94, 96, 97, 98, 99' })
    return
  }

  next()
}

export function validatePickTile(req: Request, res: Response, next: NextFunction): void {
  const { sessionId, tileIndex } = req.body

  if (typeof sessionId !== 'string' || sessionId.length === 0) {
    res.status(400).json({ error: 'sessionId is required' })
    return
  }

  if (!Number.isInteger(tileIndex) || tileIndex < 0 || tileIndex >= TOTAL_TILES) {
    res.status(400).json({ error: `tileIndex must be an integer between 0 and ${TOTAL_TILES - 1}` })
    return
  }

  next()
}

export function validateCashout(req: Request, res: Response, next: NextFunction): void {
  const { sessionId } = req.body

  if (typeof sessionId !== 'string' || sessionId.length === 0) {
    res.status(400).json({ error: 'sessionId is required' })
    return
  }

  next()
}
