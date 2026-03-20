import { useState, useEffect } from 'react'
import type { TileState } from '../../types'

interface TileProps {
  index: number
  state: TileState
  disabled: boolean
  onClick: (index: number) => void
  currentMultiplier: number
  isGuessed: boolean
  isKiller: boolean
}

export function Tile({ index, state, disabled, onClick, currentMultiplier, isGuessed, isKiller }: TileProps) {
  const [animating, setAnimating] = useState(false)
  const [prevState, setPrevState] = useState(state)

  useEffect(() => {
    // Only animate if it's a guessed tile or the killer mine
    if (state !== prevState && state !== 'unrevealed' && isGuessed) {
      setAnimating(true)
      const timer = setTimeout(() => setAnimating(false), 800)
      setPrevState(state)
      return () => clearTimeout(timer)
    }
    setPrevState(state)
  }, [state, prevState, isGuessed])

  const baseClasses =
    'relative w-full aspect-square rounded-[16px] font-bold text-xl transition-all duration-300 ease-out cursor-pointer select-none flex items-center justify-center'

  // Determine if this tile should be "muted" (revealed but not guessed)
  const isMuted = state !== 'unrevealed' && !isGuessed

  const stateClasses: Record<TileState, string> = {
    unrevealed:
      'border border-t-[rgba(255,255,255,0.15)] border-l-[rgba(255,255,255,0.08)] border-r-[rgba(0,0,0,0.3)] border-b-[rgba(0,0,0,0.6)] hover:brightness-110 hover:-translate-y-[2px] hover:shadow-[var(--tile-shadow-hover)] active:translate-y-[4px] active:shadow-[var(--tile-shadow-active)] shadow-[var(--tile-shadow)] bg-[var(--tile-bg)] hover:bg-[var(--tile-bg)]',
    safe: isMuted 
      ? 'bg-accent-green/5 border border-accent-green/20 opacity-40 scale-95'
      : 'bg-accent-green/15 border-[2px] border-accent-green/60 shadow-[0_0_40px_rgba(34,197,94,0.4),inset_0_0_20px_rgba(34,197,94,0.3)] overflow-hidden',
    mine: isMuted
      ? 'bg-accent-red/5 border border-accent-red/20 opacity-40 scale-95'
      : 'bg-accent-red/20 border-[2px] border-accent-red/80 shadow-[0_0_50px_rgba(239,68,68,0.6),inset_0_0_30px_rgba(239,68,68,0.4)]',
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

  // Determine dynamic item based on multiplier (All Diamonds now)
  let safeItem = null;
  if (state === 'safe') {
    const isBig = currentMultiplier >= 5.0;
    const diamondClass = isMuted 
      ? 'text-4xl grayscale brightness-75' 
      : `${isBig ? 'text-6xl drop-shadow-[0_0_35px_rgba(167,139,250,1)] animate-pulse brightness-125' : 'text-5xl drop-shadow-[0_0_20px_rgba(45,212,191,0.8)]'}`;
    
    safeItem = (
      <span 
        className={`${diamondClass} ${animating ? 'animate-diamond-pop' : ''} relative z-20`} 
        role="img" 
        aria-label="diamond"
      >
        💎
      </span>
    );
  }

  return (
    <button
      className={`${baseClasses} ${stateClasses[state]} ${animClasses} ${disabledClasses}`}
      onClick={() => !disabled && state === 'unrevealed' && onClick(index)}
      disabled={disabled || state !== 'unrevealed'}
    >
      {/* Light Flare Burst (Safe) ONLY for guessed tiles */}
      {animating && state === 'safe' && isGuessed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="w-full h-full bg-white/40 rounded-full animate-tile-flare" />
          
          {/* Diamond Particles */}
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="absolute text-sm animate-diamond-particle"
              style={{
                '--tx': `${(Math.random() - 0.5) * 160}px`,
                '--ty': `${(Math.random() - 0.5) * 160}px`,
                '--tr': `${Math.random() * 360}deg`,
              } as any}
            >
              💎
            </div>
          ))}
        </div>
      )}

      {/* Explosion Effects (Mine) ONLY for the guessed/killer mine */}
      {animating && state === 'mine' && isGuessed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="absolute inset-0 bg-white animate-explosion-flash rounded-[16px]" />
          
          {/* Explosion Debris */}
          {[...Array(10)].map((_, i) => (
            <div 
              key={i}
              className="absolute text-xl animate-debris"
              style={{
                '--dx': `${(Math.random() - 0.5) * 200}px`,
                '--dy': `${(Math.random() - 0.5) * 200}px`,
                '--dr': `${Math.random() * 720}deg`,
              } as any}
            >
              {['🔥', '💥', '💨', '🌑'][i % 4]}
            </div>
          ))}
        </div>
      )}

      {state === 'unrevealed' && (
        <span className="text-white/10 text-3xl opacity-0 group-hover:opacity-100 transition-opacity">?</span>
      )}
      
      {/* Decorative inner glow for safe tiles (Only for guessed) */}
      {state === 'safe' && isGuessed && (
        <div className="absolute inset-0 bg-gradient-to-tr from-accent-green/20 to-transparent opacity-50 z-10" />
      )}

      {safeItem}
      
      {state === 'mine' && (
        <span 
          className={`${isMuted ? 'text-4xl grayscale opacity-50' : 'text-6xl drop-shadow-[0_0_35px_rgba(239,68,68,1)] filter brightness-125'} relative z-20`} 
          role="img" 
          aria-label="bomb"
        >
          💣
        </span>
      )}
    </button>
  )
}
