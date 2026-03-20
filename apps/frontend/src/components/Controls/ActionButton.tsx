import type { GameStatus } from '../../types'

interface ActionButtonProps {
  status: GameStatus
  loading: boolean
  potentialPayout: number
  onStart: () => void
  onCashout: () => void
  onReset: () => void
}

export function ActionButton({
  status,
  loading,
  potentialPayout,
  onStart,
  onCashout,
  onReset,
}: ActionButtonProps) {
  if (status === 'win' || status === 'lose') {
    return (
      <button
        onClick={onReset}
        className="control-panel__action-btn control-panel__action-btn--start relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        <span className="relative z-10 drop-shadow-md">PLAY AGAIN</span>
      </button>
    )
  }

  if (status === 'active') {
    return (
      <button
        onClick={onCashout}
        disabled={loading}
        className="control-panel__action-btn control-panel__action-btn--cashout animate-[glow-pulse_2s_infinite] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        <span className="relative z-10 drop-shadow-md">
          {loading ? (
            <span className="inline-flex items-center gap-2 justify-center w-full">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              CASHING OUT...
            </span>
          ) : (
            `CASHOUT $${potentialPayout.toFixed(2)}`
          )}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={onStart}
      disabled={loading}
      className={`control-panel__action-btn control-panel__action-btn--start relative overflow-hidden group ${loading ? '' : 'animate-[glow-pulse_3s_infinite]'}`}
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      <span className="relative z-10 drop-shadow-md">
        {loading ? (
          <span className="inline-flex items-center gap-2 justify-center w-full">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            STARTING...
          </span>
        ) : (
          'START GAME'
        )}
      </span>
    </button>
  )
}
