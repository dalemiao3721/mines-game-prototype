import type { GameStatus } from '../../types'

interface GameResultOverlayProps {
  status: GameStatus
  payout: number
  multiplier: number
  betAmount: number
}

export function GameResultOverlay({
  status,
  payout,
  multiplier,
  betAmount,
}: GameResultOverlayProps) {
  if (status !== 'win' && status !== 'lose') return null

  const isWin = status === 'win'

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-md rounded-2xl animate-result-in">
      <div className="text-center space-y-4 p-8 glass-card border-glass-border">
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
          {isWin ? 'CASHED OUT' : 'BUSTED'}
        </div>

        {/* Details */}
        {isWin ? (
          <div className="space-y-1">
            <div className="text-4xl font-bold font-mono text-accent-gold drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              +${payout.toFixed(2)}
            </div>
            <div className="text-sm font-bold text-white/50 tracking-wide">
              ${betAmount.toFixed(2)} × {multiplier.toFixed(2)}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-4xl font-bold font-mono text-accent-red drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              -$0.00
            </div>
            <div className="text-sm font-bold text-white/50 tracking-wide">
              Bet of ${betAmount.toFixed(2)} forfeited
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
