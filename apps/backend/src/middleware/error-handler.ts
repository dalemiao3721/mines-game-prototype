import type { Request, Response, NextFunction } from 'express'

export class GameError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'GameError'
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof GameError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  console.error('Unexpected error:', err)
  res.status(500).json({ error: 'Internal server error' })
}
