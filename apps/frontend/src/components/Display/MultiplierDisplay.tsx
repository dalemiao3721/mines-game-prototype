import { useState, useEffect } from 'react'

interface MultiplierDisplayProps {
  multiplier: number
  isActive: boolean
}

export function MultiplierDisplay({ multiplier, isActive }: MultiplierDisplayProps) {
  const [pulse, setPulse] = useState(false)
  const [prevMultiplier, setPrevMultiplier] = useState(multiplier)

  useEffect(() => {
    if (multiplier !== prevMultiplier && multiplier > 1) {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 300)
      setPrevMultiplier(multiplier)
      return () => clearTimeout(timer)
    }
    setPrevMultiplier(multiplier)
  }, [multiplier, prevMultiplier])

  return (
    <div className="text-right">
      <div className="text-[0.65rem] font-bold text-white/50 uppercase tracking-[1.5px] mb-0.5">
        Multiplier
      </div>
      <div
        className={`text-2xl sm:text-3xl font-bold font-mono text-accent-gold drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] ${
          pulse ? 'animate-multiplier-pulse' : ''
        } ${!isActive ? 'opacity-40' : ''}`}
      >
        {multiplier.toFixed(2)}×
      </div>
    </div>
  )
}
