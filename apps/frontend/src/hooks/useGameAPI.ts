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
    // Play Start Sound IMMEDIATELY for responsiveness
    audioManager.play('start')
    
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
        // Trigger Diamond Sound with a small random pitch-like feel by cloning
        audioManager.play('diamond')
        const nextMult = 'nextMultiplier' in res ? res.nextMultiplier : 0
        actions.tileSafe(tileIndex, res.newMultiplier, nextMult)
        if ('fullClear' in res && res.fullClear) {
          audioManager.play('cashout')
          audioManager.play('cashRegister')
          actions.cashout(res.serverSeed, res.minePositions, res.payout, res.newMultiplier)
          if ('newBalance' in res && res.newBalance != null && lobby?.onBalanceUpdate) {
            lobby.onBalanceUpdate(res.newBalance)
          }
        }
      } else {
        // Trigger cinematic Double-Boom sequence: 
        // 1. Initial Blast (Bump) - Should be heavy as requested
        audioManager.play('bump')
        // 2. Rising Suspense (Bomb Fuse) - Faster to keep energy up
        setTimeout(() => audioManager.play('bomb'), 1000)
        // 3. Final Massive Shockwave (Explosion) - More distinct gap
        setTimeout(() => audioManager.play('explosion'), 1600)
        
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
      // Trigger Rich Cashout Sequence
      audioManager.play('cashout')
      audioManager.play('cashRegister')
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
