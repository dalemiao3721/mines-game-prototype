interface MineSelectorProps {
  value: number
  disabled: boolean
  onChange: (value: number) => void
}

const MINES_OPTIONS = [1, 2, 3, 4, 5, 10, 15, 20, 24]

export function MineSelector({ value, disabled, onChange }: MineSelectorProps) {
  return (
    <div className="control-panel__section">
      <span className="control-panel__label">Mines</span>
      <div className="control-panel__empty-row">
        <select
          className="control-panel__select"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
        >
          {MINES_OPTIONS.map((count) => (
            <option key={count} value={count}>
              {count} Mines
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
