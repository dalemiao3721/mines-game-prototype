import type { TileState } from '../../types'
import { Tile } from './Tile'

interface TileGridProps {
  tiles: TileState[]
  disabled: boolean
  onTileClick: (index: number) => void
}

export function TileGrid({ tiles, disabled, onTileClick }: TileGridProps) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-[400px] mx-auto">
      {tiles.map((state, index) => (
        <Tile
          key={index}
          index={index}
          state={state}
          disabled={disabled}
          onClick={onTileClick}
        />
      ))}
    </div>
  )
}
