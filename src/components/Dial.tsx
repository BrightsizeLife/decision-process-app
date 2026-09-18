import React, { useEffect, useRef, useState } from 'react';
import type { PresenceUnit } from '../types';
import { formatUnitValue, parseUsd } from '../lib/format';
import { COLORS } from '../lib/colors';

interface DialProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: PresenceUnit;
  negative?: boolean;
  disabled?: boolean;
  /** Compact readout shown under the control, e.g. "μ 0.76 · 90% interval 0.55–0.90" */
  readout?: string;
  /** Fuller accessible name for screen readers when `label` alone would be
   * ambiguous (e.g. every aspect card has a dial visibly labelled "value").
   * Falls back to `label`. */
  srLabel?: string;
}

// A "dial": a label, an editable number (click it and type), and — for the
// bounded [0,1] probability unit — a native range input under it. USD
// values have no natural bound, so they're free-typed only (no slider).
export const Dial: React.FC<DialProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  unit = 'probability',
  negative = false,
  disabled = false,
  readout,
  srLabel,
}) => {
  const accessibleName = srLabel ?? label;
  const decimals = unit === 'usd' ? 0 : 2;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // The input only exists in the DOM while editing, so it mounts already
  // focused (autoFocus) and this just needs to select what's in it — no
  // race with a click's own native cursor-placement behaviour, because the
  // click that started editing landed on the *button*, not this input.
  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const startEditing = () => {
    if (disabled) return;
    setDraft(unit === 'usd' ? String(value) : value.toFixed(decimals));
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    const parsed = unit === 'usd' ? parseUsd(draft) : Number(draft);
    if (parsed === null || Number.isNaN(parsed)) return;
    const clamped = unit === 'usd' ? parsed : Math.min(max, Math.max(min, parsed));
    onChange(clamped);
  };

  const ink = negative ? COLORS.outcomesInk : COLORS.text;

  return (
    <div className={disabled ? 'pact-dial-disabled' : ''}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="pact-dial-label" style={{ color: negative ? COLORS.outcomesInk : COLORS.muted }}>
          {label}
          {negative && <span className="pact-sr-only"> (negative)</span>}
        </span>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            className="pact-dial-value"
            style={{ color: ink }}
            autoFocus
            value={draft}
            aria-label={accessibleName}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') {
                setEditing(false);
                e.currentTarget.blur();
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="pact-dial-value"
            style={{ color: ink }}
            disabled={disabled}
            onClick={startEditing}
            aria-label={`${accessibleName}, ${formatUnitValue(value, unit, decimals)}, click to edit`}
          >
            {formatUnitValue(value, unit, decimals)}
          </button>
        )}
      </div>
      {unit === 'probability' && (
        <input
          type="range"
          className="pact-dial"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={accessibleName}
          aria-valuetext={`${value.toFixed(decimals)}${negative ? ', negative' : ''}`}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}
      {readout && <div className="pact-dial-readout">{readout}</div>}
    </div>
  );
};
