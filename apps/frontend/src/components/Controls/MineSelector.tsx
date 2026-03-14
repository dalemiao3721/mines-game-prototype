interface MineSelectorProps {
  value: number
  disabled: boolean
  onChange: (value: number) => void
}

const MINES_OPTIONS = [1, 2, 3, 4, 5, 10, 15, 20, 24]

export function MineSelector({ value, disabled, onChange }: MineSelectorProps) {
  return (
    <div className="control-panel__section">
      <div className="flex justify-between items-center mb-1">
        <span className="control-panel__label">Mines</span>
        <span className="text-[10px] font-bold text-accent-red bg-accent-red/10 px-2 py-0.5 rounded-[4px] uppercase tracking-widest">
          {value} Actives
        </span>
      </div>
      <div className="control-panel__select-wrap">
        <select
          className="control-panel__select"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
        >
          {MINES_OPTIONS.map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
