import type { RTPSetting } from '../../types'

interface RTPSelectorProps {
  value: RTPSetting
  disabled: boolean
  onChange: (value: RTPSetting) => void
}

const RTP_OPTIONS: RTPSetting[] = [94, 96, 97, 98, 99]

export function RTPSelector({ value, disabled, onChange }: RTPSelectorProps) {
  return (
    <div className="control-panel__section">
      <span className="control-panel__label">RTP</span>
      <div className="control-panel__select-wrap">
        <select
          className="control-panel__select"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value) as RTPSetting)}
        >
          {RTP_OPTIONS.map((rtp) => (
            <option key={rtp} value={rtp}>
              {rtp}%
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
