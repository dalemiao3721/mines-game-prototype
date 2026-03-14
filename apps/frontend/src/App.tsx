import { useMemo } from 'react'
import { GameBoard } from './components/GameBoard/GameBoard'
import { GameResultOverlay } from './components/Display/GameResultOverlay'
import { MultiplierDisplay } from './components/Display/MultiplierDisplay'
import { PayoutDisplay } from './components/Display/PayoutDisplay'
import { BetInput } from './components/Controls/BetInput'
import { MineSelector } from './components/Controls/MineSelector'
import { ActionButton } from './components/Controls/ActionButton'
import { useGameState } from './hooks/useGameState'
import { useGameAPI } from './hooks/useGameAPI'
import { calcMultiplier } from './utils/multiplier'

export default function App() {
  const {
    state,
    setBet,
    setMines,
    setRTP,
    gameStarted,
    tileSafe,
    tileMine,
    cashout,
    reset,
  } = useGameState()

  const actions = useMemo(
    () => ({ gameStarted, tileSafe, tileMine, cashout }),
    [gameStarted, tileSafe, tileMine, cashout],
  )

  const { loading, error, startGame, pickTile, doCashout } = useGameAPI(state, actions)

  // Extract logic for next payout calculation
  const safeOpened = state.tiles.filter((t) => t === 'safe').length
  const nextMultiplier = calcMultiplier(state.mineCount, safeOpened + 1, state.rtp)
  const nextPayoutRaw = state.betAmount * nextMultiplier
  const nextPayout = nextPayoutRaw.toFixed(2)

  const isActive = state.status === 'active'
  const isGameOver = state.status === 'win' || state.status === 'lose'
  const tilesDisabled = !isActive || loading

  return (
    <div className="app">
      {error && <div className="app__error">{error}</div>}

      <div className="app__main">
        {/* Left Control Panel / Sidebar */}
        <div className="app__left">
          
          {/* Balance Card */}
          <div className="control-card control-panel__section mb-4">
            <span className="control-panel__label">Available Balance</span>
            <div className="control-panel__balance">
              <span>$</span>{(1000).toFixed(2) /* TODO: hook up real balance */}
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
                
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--glass-border)] rounded-[10px] p-2 flex flex-col items-center justify-center">
                   <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Potential Payout</span>
                   <span className="text-[14px] font-bold text-accent-green">
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
              onReset={reset}
            />
            {isActive && (
              <div className="text-center bg-[var(--color-bg-secondary)] border border-[rgba(245,185,61,0.3)] rounded-[16px] p-3 shadow-[0_0_20px_rgba(245,185,61,0.15)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(245,185,61,0.1)] to-transparent animate-glow-pulse pointer-events-none" />
                <span className="text-[12px] font-black text-white/80 uppercase tracking-widest block mb-1">Next Multiplier</span>
                <span className="text-[20px] font-black text-accent-gold drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                   ${nextPayout} <span className="text-[14px] text-white/60 drop-shadow-none">({nextMultiplier}x)</span>
                </span>
              </div>
            )}
          </div>
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
              />
              <GameResultOverlay
                status={state.status}
                payout={state.potentialPayout}
                multiplier={state.currentMultiplier}
                betAmount={state.betAmount}
                onReset={reset}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
