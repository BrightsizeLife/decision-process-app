import React from 'react';

interface SliderProps {
  label: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  negative?: boolean;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  negative = false,
  disabled = false,
}) => {
  return (
    <div className={disabled ? 'opacity-40' : ''}>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className={`font-mono uppercase tracking-wider ${negative ? 'text-[#FF5757]' : 'text-[#8a8680]'}`}>
          {label}
        </span>
        <span className={`font-mono tabular-nums ${negative ? 'text-[#FF5757]' : 'text-[#f0ede6]'}`}>
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        className={`cs-slider ${negative ? 'negative' : ''}`}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};
