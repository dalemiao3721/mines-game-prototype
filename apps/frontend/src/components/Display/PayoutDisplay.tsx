interface PayoutDisplayProps {
  betAmount: number
  payout: number
  isActive: boolean
}

export function PayoutDisplay({ betAmount, payout, isActive }: PayoutDisplayProps) {
  return (
    <div className="flex flex-col items-end text-sm">
      <div className="text-[0.65rem] font-bold text-white/50 uppercase tracking-[1px] mb-0.5">
        Potential Payout
      </div>
      <div>
        <span
          className={`font-mono text-lg font-bold ${
            isActive && payout > betAmount
              ? 'text-accent-green drop-shadow-[0_0_8px_rgba(57,255,20,0.3)]'
              : 'text-white/60'
          }`}
        >
          ${payout.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
