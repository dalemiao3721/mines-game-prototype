import type { TileState } from '../../types'
import { Tile } from './Tile'

interface TileGridProps {
  tiles: TileState[]
  disabled: boolean
  onTileClick: (index: number) => void
  currentMultiplier: number
  guessedIndices: number[]
}

export function TileGrid({ tiles, disabled, onTileClick, currentMultiplier, guessedIndices }: TileGridProps) {
  return (
    <div className="tile-grid grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-[500px] sm:aspect-square mx-auto content-center">
      {tiles.map((state, index) => {
        const isGuessed = guessedIndices.includes(index)
        const isKiller = isGuessed && state === 'mine'
        return (
          <Tile
            key={index}
            index={index}
            state={state}
            disabled={disabled}
            onClick={onTileClick}
            currentMultiplier={currentMultiplier}
            isGuessed={isGuessed}
            isKiller={isKiller}
          />
        )
      })}
    </div>
  )
}
