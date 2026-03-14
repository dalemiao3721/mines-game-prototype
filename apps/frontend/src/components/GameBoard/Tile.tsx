import { useState, useEffect } from 'react'
import type { TileState } from '../../types'

interface TileProps {
  index: number
  state: TileState
  disabled: boolean
  onClick: (index: number) => void
}

export function Tile({ index, state, disabled, onClick }: TileProps) {
  const [animating, setAnimating] = useState(false)
  const [prevState, setPrevState] = useState(state)

  useEffect(() => {
    if (state !== prevState && state !== 'unrevealed') {
      setAnimating(true)
      const timer = setTimeout(() => setAnimating(false), 600)
      setPrevState(state)
      return () => clearTimeout(timer)
    }
    setPrevState(state)
  }, [state, prevState])

  const baseClasses =
    'relative w-full aspect-square rounded-[16px] font-bold text-xl transition-all duration-200 cursor-pointer select-none flex items-center justify-center'

  const stateClasses: Record<TileState, string> = {
    unrevealed:
      'bg-bg-panel border-[2px] border-glass-border hover:bg-[rgba(255,255,255,0.08)] hover:border-accent-purple/50 shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)] active:scale-95 active:shadow-[inset_0_8px_20px_rgba(0,0,0,0.6)]',
    safe:
      'bg-accent-green/10 border-[2px] border-accent-green/50 shadow-[0_0_20px_rgba(57,255,20,0.2),inset_0_4px_12px_rgba(0,0,0,0.5)]',
    mine:
      'bg-accent-red/10 border-[2px] border-accent-red/50 shadow-[0_0_20px_rgba(239,68,68,0.2),inset_0_4px_12px_rgba(0,0,0,0.5)]',
  }

  const animClasses = animating
    ? state === 'safe'
      ? 'animate-tile-flip animate-tile-safe'
      : 'animate-tile-flip animate-tile-mine'
    : ''

  const disabledClasses =
    disabled && state === 'unrevealed'
      ? 'opacity-60 cursor-not-allowed hover:bg-bg-panel hover:border-glass-border active:scale-100'
      : ''

  return (
    <button
      className={`${baseClasses} ${stateClasses[state]} ${animClasses} ${disabledClasses}`}
      onClick={() => !disabled && state === 'unrevealed' && onClick(index)}
      disabled={disabled || state !== 'unrevealed'}
    >
      {state === 'unrevealed' && (
        <span className="text-white/10 text-3xl opacity-0 group-hover:opacity-100 transition-opacity">?</span>
      )}
      {state === 'safe' && (
        <span className="text-4xl drop-shadow-[0_0_15px_rgba(57,255,20,0.6)]" role="img" aria-label="gem">
          💎
        </span>
      )}
      {state === 'mine' && (
        <span className="text-4xl drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" role="img" aria-label="bomb">
          💣
        </span>
      )}
    </button>
  )
}
