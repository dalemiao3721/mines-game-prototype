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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-result-in transition-all">
      <div className="text-center space-y-6 p-10 bg-[var(--color-bg-panel)] backdrop-blur-xl border border-white/10 rounded-[28px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] min-w-[340px] transform transition-all hover:scale-[1.02]">
        {/* Icon */}
        <div className="text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          {isWin ? '💎' : '💣'}
        </div>

        {/* Title */}
          <div
          className={`text-3xl font-black tracking-[3px] uppercase ${
            isWin 
              ? 'text-accent-green drop-shadow-[0_0_15px_rgba(57,255,20,0.4)]'
              : 'text-accent-red drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]'
          }`}
        >
          {isWin ? 'CASHED OUT' : 'GAME OVER'}
        </div>

        {/* Details */}
        {isWin ? (
          <div className="space-y-5 flex flex-col items-center">
            <div className="space-y-2">
              <div className="text-5xl font-bold font-mono text-accent-gold drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                +${payout.toFixed(2)}
              </div>
              <div className="text-md font-bold text-white/50 tracking-wide">
                ${betAmount.toFixed(2)} × {multiplier.toFixed(2)}
              </div>
            </div>
            
            <button
              onClick={onReset}
              className="control-panel__action-btn control-panel__action-btn--start mt-4 px-12 py-3 w-auto min-w-[200px]"
            >
              PLAY AGAIN
            </button>
          </div>
        ) : (
          <div className="space-y-5 flex flex-col items-center">
            <div className="space-y-2">
              <div className="text-5xl font-bold font-mono text-accent-red drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                $0.00
              </div>
              <div className="text-md font-bold text-white/50 tracking-wide">
                -${betAmount.toFixed(2)} lost
              </div>
            </div>
            
            <button
              onClick={onReset}
              className="control-panel__action-btn control-panel__action-btn--start mt-4 px-12 py-3 w-auto min-w-[200px]"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
