import type { GameStatus } from '../../types'

interface GameResultOverlayProps {
  status: GameStatus
  payout: number
  multiplier: number
  betAmount: number
  onReset: () => void
}

export function GameResultOverlay({
  status,
  payout,
  multiplier,
  betAmount,
  onReset,
}: GameResultOverlayProps) {
  if (status !== 'win' && status !== 'lose') return null

  const isWin = status === 'win'

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-all ${!isWin ? 'animate-lose-vignette' : ''}`}>
      
      {/* Radiant Background for Win */}
      {isWin && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent-gold/20 via-accent-green/10 to-transparent animate-win-radiance opacity-60" />
          
          {/* Simple CSS Particles */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="absolute text-2xl animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '-20px',
                '--td': `${2 + Math.random() * 2}s`,
                '--tx': `${(Math.random() - 0.5) * 400}px`,
                '--tr': `${Math.random() * 720}deg`,
                opacity: 0.6
              } as any}
            >
              {['✨', '💎', '⭐', '🟡'][i % 4]}
            </div>
          ))}
        </div>
      )}

      <div className={`text-center space-y-6 p-10 bg-[var(--color-bg-panel)] backdrop-blur-xl border border-white/10 rounded-[28px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] min-w-[340px] transform transition-all hover:scale-[1.02] relative z-10 animate-result-in ${!isWin ? 'animate-shake-heavy' : ''}`}>
        
        {/* Glow behind card */}
        <div className={`absolute -inset-1 rounded-[30px] blur-2xl opacity-20 pointer-events-none ${isWin ? 'bg-accent-gold' : 'bg-accent-red'}`} />

        {/* Icon */}
        <div className={`text-7xl mb-2 ${isWin ? 'drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]' : 'drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]'}`}>
          {isWin ? '🏆' : '💥'}
        </div>

        {/* Title */}
        <div
          className={`text-4xl font-black tracking-[4px] uppercase ${
            isWin 
              ? 'text-accent-gold drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]'
              : 'text-accent-red drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]'
          }`}
        >
          {isWin ? 'BIG WIN!' : 'KABOOM!'}
        </div>

        {/* Details */}
        <div className="space-y-6 flex flex-col items-center">
          <div className="space-y-2">
            <div className={`text-6xl font-black font-mono tracking-tighter ${isWin ? 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-accent-red/80'}`}>
              {isWin ? `+$${payout.toFixed(2)}` : '$0.00'}
            </div>
            <div className="text-lg font-bold text-white/40 tracking-widest uppercase">
              {isWin ? `${multiplier.toFixed(2)}x Multiplier` : `-$${betAmount.toFixed(2)} Lost`}
            </div>
          </div>
          
          <button
            onClick={onReset}
            className={`control-panel__action-btn px-12 py-4 w-auto min-w-[220px] shadow-2xl transition-all active:scale-95 ${
              isWin ? 'control-panel__action-btn--start' : 'control-panel__action-btn--gameover'
            }`}
          >
            {isWin ? 'COLLECT & PLAY' : 'TRY AGAIN'}
          </button>
        </div>
      </div>
    </div>
  )
}
