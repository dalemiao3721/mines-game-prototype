import { useMemo, useCallback } from 'react'
import { GameBoard } from './components/GameBoard/GameBoard'
import { GameResultOverlay } from './components/Display/GameResultOverlay'
import { MultiplierDisplay } from './components/Display/MultiplierDisplay'
import { PayoutDisplay } from './components/Display/PayoutDisplay'
import { BetInput } from './components/Controls/BetInput'
import { MineSelector } from './components/Controls/MineSelector'
import { ActionButton } from './components/Controls/ActionButton'
// import { SeedVerifier } from './components/FairVerifier/SeedVerifier' // Provably Fair 面板，尚未啟用
import { useGameState } from './hooks/useGameState'
import { useGameAPI } from './hooks/useGameAPI'
import { gameApi } from './api/gameApi'
import { useState, useEffect } from 'react'

/**
 * Read lobby params from URL query string.
 * ?token=xxx&sessionId=yyy  => lobby mode
 * No token => standalone mode
 */
function useLobbyParams() {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const lobbyToken = params.get('token')
  const lobbySessionId = params.get('sessionId')
  const isLobbyMode = Boolean(lobbyToken && lobbySessionId)
  const isForcedMobile = window.location.pathname.includes('/m/') || window.location.pathname.endsWith('/m')
  return { lobbyToken, lobbySessionId, isLobbyMode, isForcedMobile }
}

export default function App() {
  const { lobbyToken, lobbySessionId, isLobbyMode, isForcedMobile } = useLobbyParams()
  const [balance, setBalance] = useState<number>(0)

  // Fetch balance: from lobby API if in lobby mode, from local endpoint otherwise
  const fetchBalance = useCallback(async () => {
    if (isLobbyMode && lobbyToken) {
      try {
        const data = await gameApi.getLobbyBalance(lobbyToken)
        setBalance(data.balance)
      } catch (err) {
        console.error('Failed to fetch lobby balance', err)
      }
    } else {
      try {
        const res = await fetch('/api/account/balance')
        const data = await res.json()
        setBalance(data.balance)
      } catch (err) {
        console.error('Failed to fetch balance', err)
      }
    }
  }, [isLobbyMode, lobbyToken])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  const {
    state,
    setBet,
    setMines,
    setRTP,
    gameStarted,
    tileSafe,
    tileMine,
    cashout,
    dismissResult,
    reset,
  } = useGameState()

  const actions = useMemo(
    () => ({ gameStarted, tileSafe, tileMine, cashout }),
    [gameStarted, tileSafe, tileMine, cashout],
  )

  const lobbyOptions = useMemo(
    () => ({
      lobbyToken,
      lobbySessionId,
      onBalanceUpdate: (newBalance: number) => setBalance(newBalance),
    }),
    [lobbyToken, lobbySessionId],
  )

  const { loading, error, startGame, pickTile, doCashout } = useGameAPI(state, actions, lobbyOptions)

  // Use backend-provided nextMultiplier (single source of truth)
  const nextMultiplier = state.nextMultiplier
  const nextPayout = (state.betAmount * nextMultiplier).toFixed(2)

  const isActive = state.status === 'active'
  const isGameOver = state.status === 'win' || state.status === 'lose'
  const tilesDisabled = !isActive || loading

  const isMobile = isForcedMobile // We can add more detection if needed

  return (
    <div className={`app ${isMobile ? 'app--mobile' : ''}`}>
      {error && <div className="app__error">{error}</div>}

      <div className="app__main">
        {/* Left Control Panel / Sidebar */}
        <div className="app__left">

          {/* Balance Card */}
          <div className="control-card control-panel__section mb-4">
            <span className="control-panel__label">Available Balance</span>
            <div className="control-panel__balance">
              <span>$</span>{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Configuration Card */}
          <div className="control-card flex flex-col gap-6 mb-4">
            <BetInput
              value={state.betAmount}
              disabled={isActive || isGameOver}
              onChange={setBet}
            />

            <div className="control-panel__row">
              <div className="flex-1 space-y-2">
                <MineSelector
                  value={state.mineCount}
                  disabled={isActive || isGameOver}
                  onChange={setMines}
                />

                <div className="bg-[var(--color-bg-secondary)] border border-[var(--glass-border)] rounded-[10px] py-2 px-3 flex flex-col items-start justify-center">
                   <span className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Potential Payout</span>
                   <span className="text-[18px] font-bold text-accent-green">
                     ${isActive ? state.potentialPayout.toFixed(2) : '0.00'}
                   </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <ActionButton
              status={state.status}
              loading={loading}
              potentialPayout={state.potentialPayout}
              onStart={startGame}
              onCashout={doCashout}
              onReset={dismissResult}
            />
            {isActive && (
              <div className="text-left bg-[var(--color-bg-secondary)] border border-[rgba(245,185,61,0.3)] rounded-[10px] sm:rounded-[16px] py-1.5 sm:py-3 px-3 sm:px-4 shadow-[0_0_20px_rgba(245,185,61,0.15)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(245,185,61,0.1)] via-[rgba(245,185,61,0.05)] to-transparent animate-glow-pulse pointer-events-none" />
                <span className="text-[10px] sm:text-[14px] font-black text-white/80 uppercase tracking-widest block mb-0.5 sm:mb-1">Next Multiplier</span>
                <span className="text-[16px] sm:text-[24px] font-black text-accent-gold drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                   ${nextPayout} <span className="text-[12px] sm:text-[16px] text-white/60 drop-shadow-none">({nextMultiplier}x)</span>
                </span>
              </div>
            )}
          </div>

          {/* Provably Fair 面板 — 尚未啟用，已隱藏 */}
          {/* <div className="control-card">
            <SeedVerifier
              serverSeedHash={state.serverSeedHash}
              serverSeed={state.serverSeed}
              minePositions={state.minePositions}
            />
          </div> */}
        </div>

        {/* Center Game Area */}
        <div className="app__center">
          <div className="game-board">
            <div className="game-board__header">
              <div className="game-board__title-area">
                <h1 className="game-board__title">SUPER MINES</h1>
                <span className="game-board__subtitle">FIND THE GEMS, AVOID THE BOMBS!</span>
              </div>

              <div className="game-board__status-area">
                <MultiplierDisplay
                  multiplier={state.currentMultiplier}
                  isActive={isActive}
                />
              </div>
            </div>

            <div className="relative w-full">
              <GameBoard
                tiles={state.tiles}
                disabled={tilesDisabled}
                onTileClick={pickTile}
                currentMultiplier={state.currentMultiplier}
              />
              <GameResultOverlay
                status={state.status}
                payout={state.potentialPayout}
                multiplier={state.currentMultiplier}
                betAmount={state.betAmount}
                onReset={dismissResult}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
