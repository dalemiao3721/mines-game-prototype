import type { TileState } from '../../types'
import { TileGrid } from './TileGrid'

interface GameBoardProps {
  tiles: TileState[]
  disabled: boolean
  onTileClick: (index: number) => void
  currentMultiplier: number
  guessedIndices: number[]
}

export function GameBoard({ tiles, disabled, onTileClick, currentMultiplier, guessedIndices }: GameBoardProps) {
  return (
    <div className="glass-card p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent-purple/10 blur-[80px] animate-glow-pulse" />
      </div>

      <div className="relative z-10">
        <TileGrid tiles={tiles} disabled={disabled} onTileClick={onTileClick} currentMultiplier={currentMultiplier} guessedIndices={guessedIndices} />
      </div>
    </div>
  )
}
