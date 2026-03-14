import { useMemo } from 'react'
import { GameBoard } from './components/GameBoard/GameBoard'
import { GameResultOverlay } from './components/Display/GameResultOverlay'
import { MultiplierDisplay } from './components/Display/MultiplierDisplay'
import { PayoutDisplay } from './components/Display/PayoutDisplay'
import { BetInput } from './components/Controls/BetInput'
import { MineSelector } from './components/Controls/MineSelector'
import { RTPSelector } from './components/Controls/RTPSelector'
import { ActionButton } from './components/Controls/ActionButton'
import { SeedVerifier } from './components/FairVerifier/SeedVerifier'
import { useGameState } from './hooks/useGameState'
import { useGameAPI } from './hooks/useGameAPI'

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
              <div className="flex-1">
                <MineSelector
                  value={state.mineCount}
                  disabled={isActive || isGameOver}
                  onChange={setMines}
                />
              </div>
              <div className="flex-1">
                <RTPSelector
                  value={state.rtp}
                  disabled={isActive || isGameOver}
                  onChange={setRTP}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <ActionButton
              status={state.status}
              loading={loading}
              potentialPayout={state.potentialPayout}
              onStart={startGame}
              onCashout={doCashout}
              onReset={reset}
            />
          </div>
          
          <div className="control-card p-4">
             <SeedVerifier
              serverSeedHash={state.serverSeedHash}
              serverSeed={state.serverSeed}
              minePositions={state.minePositions}
            />
          </div>
        </div>

        {/* Center Game Area */}
        <div className="app__center">
          <div className="game-board">
            <div className="game-board__header">
              <div className="game-board__title-area">
                <h1 className="game-board__title">SUPER MINES</h1>
                <span className="game-board__subtitle">Provably Fair Game</span>
              </div>
              
              <div className="game-board__status-area">
                <MultiplierDisplay
                  multiplier={state.currentMultiplier}
                  isActive={isActive}
                />
                <PayoutDisplay
                  betAmount={state.betAmount}
                  payout={state.potentialPayout}
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
