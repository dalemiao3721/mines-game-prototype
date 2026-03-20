interface BetInputProps {
  value: number
  disabled: boolean
  onChange: (value: number) => void
}

export function BetInput({ value, disabled, onChange }: BetInputProps) {
  const handleDecrement = () => onChange(Math.max(1, value - 10))
  const handleIncrement = () => onChange(value + 10)

  return (
    <div className="control-panel__section">
      <span className="control-panel__label">Bet Amount</span>
      <div className="control-panel__bet-row">
        <button
          className="control-panel__bet-btn"
          onClick={handleDecrement}
          disabled={disabled || value <= 1}
        >
          -
        </button>
        <div className="control-panel__bet-input-wrap">
          <span className="control-panel__bet-prefix">$</span>
          <input
            className="control-panel__bet-input"
            type="number"
            min={1}
            step={1}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
          />
        </div>
        <button
          className="control-panel__bet-btn"
          onClick={handleIncrement}
          disabled={disabled}
        >
          +
        </button>
      </div>
    </div>
  )
}
