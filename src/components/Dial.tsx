import React from 'react';
import { EditableNumber } from './EditableNumber';
import { COLORS } from '../lib/colors';

interface DialProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  negative?: boolean;
  // Fuller accessible name for screen readers when `label` alone would be
  // ambiguous (every card has a dial visibly labelled "weight" or similar).
  srLabel?: string;
}

// A 0–1 dial: label, click-to-type number, and a native range input.
export const Dial: React.FC<DialProps> = ({ label, value, onChange, negative = false, srLabel }) => {
  const name = srLabel ?? label;
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="pact-dial-label" style={{ color: negative ? COLORS.outcomesInk : COLORS.muted }}>
          {label}
          {negative && <span className="pact-sr-only"> (negative valence)</span>}
        </span>
        <EditableNumber
          value={value}
          onCommit={onChange}
          kind="score"
          min={0}
          max={1}
          ariaLabel={name}
          color={negative ? COLORS.outcomesInk : COLORS.text}
        />
      </div>
      <input
        type="range"
        className="pact-dial"
        min={0}
        max={1}
        step={0.01}
        value={value}
        aria-label={name}
        aria-valuetext={`${value.toFixed(2)}${negative ? ', negative valence' : ''}`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};
