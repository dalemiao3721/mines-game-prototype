import { useState, useCallback } from 'react'
import { gameApi } from '../api/gameApi'
import type { GameState } from './useGameState'

interface GameActions {
  gameStarted: (sessionId: string, serverSeedHash: string) => void
  tileSafe: (tileIndex: number, newMultiplier: number) => void
  tileMine: (tileIndex: number, serverSeed: string, minePositions: number[]) => void
  cashout: (serverSeed: string, minePositions: number[], payout: number, finalMultiplier: number) => void
}

export function useGameAPI(state: GameState, actions: GameActions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startGame = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await gameApi.start({
        betAmount: state.betAmount,
        mineCount: state.mineCount,
        rtp: state.rtp,
      })
      actions.gameStarted(res.sessionId, res.serverSeedHash)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start game')
    } finally {
      setLoading(false)
    }
  }, [state.betAmount, state.mineCount, state.rtp, actions])

  const pickTile = useCallback(async (tileIndex: number) => {
    if (!state.sessionId) return
    setLoading(true)
    setError(null)
    try {
      const res = await gameApi.pick({ sessionId: state.sessionId, tileIndex })
      if (res.result === 'safe') {
        actions.tileSafe(tileIndex, res.newMultiplier)
      } else {
        actions.tileMine(tileIndex, res.serverSeed, res.minePositions)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to pick tile')
    } finally {
      setLoading(false)
    }
  }, [state.sessionId, actions])

  const doCashout = useCallback(async () => {
    if (!state.sessionId) return
    setLoading(true)
    setError(null)
    try {
      const res = await gameApi.cashout({ sessionId: state.sessionId })
      actions.cashout(res.serverSeed, res.minePositions, res.payout, res.finalMultiplier)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to cashout')
    } finally {
      setLoading(false)
    }
  }, [state.sessionId, actions])

  return { loading, error, startGame, pickTile, doCashout }
}
