import { useState, useCallback } from 'react'
import { gameApi } from '../api/gameApi'
import { audioManager } from '../utils/audio'
import type { GameState } from './useGameState'

interface GameActions {
  gameStarted: (sessionId: string, serverSeedHash: string, nextMultiplier: number) => void
  tileSafe: (tileIndex: number, newMultiplier: number, nextMultiplier: number) => void
  tileMine: (tileIndex: number, serverSeed: string, minePositions: number[]) => void
  cashout: (serverSeed: string, minePositions: number[], payout: number, finalMultiplier: number) => void
}

interface LobbyOptions {
  lobbyToken?: string | null
  lobbySessionId?: string | null
  onBalanceUpdate?: (newBalance: number) => void
}

export function useGameAPI(state: GameState, actions: GameActions, lobby?: LobbyOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startGame = useCallback(async () => {
    // Play High-Volume Pro Start Click
    audioManager.play('start', 2.0)
    
    setLoading(true)
    setError(null)
    try {
      const req: Parameters<typeof gameApi.start>[0] = {
        betAmount: state.betAmount,
        mineCount: state.mineCount,
        rtp: state.rtp,
      }
      if (lobby?.lobbyToken && lobby?.lobbySessionId) {
        req.lobbyToken = lobby.lobbyToken
        req.lobbySessionId = lobby.lobbySessionId
      }
      const res = await gameApi.start(req)
      actions.gameStarted(res.sessionId, res.serverSeedHash, res.nextMultiplier)
      if (res.lobbyBalance != null && lobby?.onBalanceUpdate) {
        lobby.onBalanceUpdate(res.lobbyBalance)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start game')
    } finally {
      setLoading(false)
    }
  }, [state.betAmount, state.mineCount, state.rtp, actions, lobby])

  const pickTile = useCallback(async (tileIndex: number) => {
    if (!state.sessionId) return
    setLoading(true)
    setError(null)
    try {
      const res = await gameApi.pick({ sessionId: state.sessionId, tileIndex })
      if (res.result === 'safe') {
        audioManager.play('diamond', 1.5)
        const nextMult = 'nextMultiplier' in res ? res.nextMultiplier : 0
        actions.tileSafe(tileIndex, res.newMultiplier, nextMult)
        if ('fullClear' in res && res.fullClear) {
          audioManager.play('cashout', 2.0)
          audioManager.play('cashRegister', 2.0)
          actions.cashout(res.serverSeed, res.minePositions, res.payout, res.newMultiplier)
          if ('newBalance' in res && res.newBalance != null && lobby?.onBalanceUpdate) {
            lobby.onBalanceUpdate(res.newBalance)
          }
        }
      } else {
        // Multi-Layered Cinematic Explosion Sequence:
        // 1. Sharp Trigger (Bump) - High Gain for clarity
        audioManager.play('bump', 2.5)
        
        // 2. The Final Payoff (Layered Blast) after 1.2s suspense
        setTimeout(() => {
          // Play both Bloom and Shockwave layers simultaneously for depth
          audioManager.play('explosion', 3.0)
          audioManager.play('shockwave', 2.0)
        }, 1200)
        
        actions.tileMine(tileIndex, res.serverSeed, res.minePositions)
        if (res.newBalance != null && lobby?.onBalanceUpdate) {
          lobby.onBalanceUpdate(res.newBalance)
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to pick tile')
    } finally {
      setLoading(false)
    }
  }, [state.sessionId, actions, lobby])

  const doCashout = useCallback(async () => {
    if (!state.sessionId) return
    setLoading(true)
    setError(null)
    try {
      const res = await gameApi.cashout({ sessionId: state.sessionId })
      audioManager.play('cashout', 2.5)
      audioManager.play('cashRegister', 2.0)
      actions.cashout(res.serverSeed, res.minePositions, res.payout, res.finalMultiplier)
      if (res.newBalance != null && lobby?.onBalanceUpdate) {
        lobby.onBalanceUpdate(res.newBalance)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to cashout')
    } finally {
      setLoading(false)
    }
  }, [state.sessionId, actions, lobby])

  return { loading, error, startGame, pickTile, doCashout }
}
