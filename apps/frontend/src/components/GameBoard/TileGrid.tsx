import type { TileState } from '../../types'
import { Tile } from './Tile'

interface TileGridProps {
  tiles: TileState[]
  disabled: boolean
  onTileClick: (index: number) => void
  currentMultiplier: number
}

export function TileGrid({ tiles, disabled, onTileClick, currentMultiplier }: TileGridProps) {
  return (
    <div className="tile-grid grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-[500px] sm:aspect-square mx-auto content-center">
      {tiles.map((state, index) => (
        <Tile
          key={index}
          index={index}
          state={state}
          disabled={disabled}
          onClick={onTileClick}
          currentMultiplier={currentMultiplier}
        />
      ))}
    </div>
  )
}
