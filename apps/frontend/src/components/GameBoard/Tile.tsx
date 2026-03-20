import { useState, useEffect } from 'react'
import type { TileState } from '../../types'

interface TileProps {
  index: number
  state: TileState
  disabled: boolean
  onClick: (index: number) => void
  currentMultiplier: number
}

export function Tile({ index, state, disabled, onClick, currentMultiplier }: TileProps) {
  const [animating, setAnimating] = useState(false)
  const [prevState, setPrevState] = useState(state)

  useEffect(() => {
    if (state !== prevState && state !== 'unrevealed') {
      setAnimating(true)
      const timer = setTimeout(() => setAnimating(false), 800)
      setPrevState(state)
      return () => clearTimeout(timer)
    }
    setPrevState(state)
  }, [state, prevState])

  const baseClasses =
    'relative w-full aspect-square rounded-[16px] font-bold text-xl transition-all duration-300 ease-out cursor-pointer select-none flex items-center justify-center will-change-transform'

  const stateClasses: Record<TileState, string> = {
    unrevealed:
      'border border-t-[rgba(255,255,255,0.15)] border-l-[rgba(255,255,255,0.08)] border-r-[rgba(0,0,0,0.3)] border-b-[rgba(0,0,0,0.6)] hover:brightness-110 hover:-translate-y-[2px] hover:shadow-[var(--tile-shadow-hover)] active:translate-y-[4px] active:shadow-[var(--tile-shadow-active)] shadow-[var(--tile-shadow)] bg-[var(--tile-bg)] hover:bg-[var(--tile-bg)]',
    safe:
      'bg-accent-green/15 border-[2px] border-accent-green/60 shadow-[0_0_30px_rgba(34,197,94,0.3),inset_0_0_20px_rgba(34,197,94,0.2)]',
    mine:
      'bg-accent-red/20 border-[2px] border-accent-red/80 shadow-[0_0_40px_rgba(239,68,68,0.5),inset_0_0_30px_rgba(239,68,68,0.3)]',
  }

  const animClasses = animating
    ? state === 'safe'
      ? 'animate-tile-impact-safe z-20'
      : 'animate-tile-impact-mine z-20'
    : state !== 'unrevealed' ? 'z-10' : 'z-0'

  const disabledClasses =
    disabled && state === 'unrevealed'
      ? 'opacity-60 cursor-not-allowed hover:bg-bg-panel hover:border-glass-border active:scale-100'
      : ''

  // Determine dynamic item based on multiplier
  let safeItem = null;
  if (state === 'safe') {
    if (currentMultiplier >= 5.0) {
      safeItem = (
        <span className="text-6xl drop-shadow-[0_0_25px_rgba(167,139,250,0.8)] animate-pulse" role="img" aria-label="big-diamond">
          💎
        </span>
      );
    } else if (currentMultiplier >= 2.0) {
      safeItem = (
        <span className="text-4xl drop-shadow-[0_0_15px_rgba(45,212,191,0.6)]" role="img" aria-label="small-diamond">
          💎
        </span>
      );
    } else {
      safeItem = (
        <span className="text-4xl drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" role="img" aria-label="gold-bar">
          🟡
        </span>
      ); // Using 🟡 or 💰 as gold nugget/bar representation
    }
  }

  return (
    <button
      className={`${baseClasses} ${stateClasses[state]} ${animClasses} ${disabledClasses}`}
      onClick={() => !disabled && state === 'unrevealed' && onClick(index)}
      disabled={disabled || state !== 'unrevealed'}
    >
      {state === 'unrevealed' && (
        <span className="text-white/10 text-3xl opacity-0 group-hover:opacity-100 transition-opacity">?</span>
      )}
      {safeItem}
      {state === 'mine' && (
        <span className="text-5xl drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]" role="img" aria-label="bomb">
          💣
        </span>
      )}
    </button>
  )
}
