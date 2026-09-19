import React from 'react';

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
  size?: 'sm' | 'lg';
}

// A row of buttons where exactly one is pressed. Real buttons with
// aria-pressed, so it works by keyboard and reads correctly to a screen reader.
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'sm',
}: SegmentedProps<T>) {
  return (
    <div className="pact-segmented" data-size={size} role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
