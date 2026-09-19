import React, { useEffect, useRef, useState } from 'react';
import type { NumberKind } from '../types';
import { formatNumber, parseNumber } from '../lib/format';

interface EditableNumberProps {
  value: number;
  onCommit: (v: number) => void;
  kind: NumberKind;
  ariaLabel: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  color?: string;
}

// A number you click and type into. It's a button until clicked, then a
// fresh autofocused input that selects its contents — no race with the
// click's own native cursor placement.
export const EditableNumber: React.FC<EditableNumberProps> = ({
  value,
  onCommit,
  kind,
  ariaLabel,
  min,
  max,
  disabled = false,
  color,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const shown = formatNumber(value, kind);

  const commit = () => {
    setEditing(false);
    const parsed = parseNumber(draft);
    if (parsed === null) return;
    let next = parsed;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    onCommit(next);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        className="pact-dial-value"
        style={{ color }}
        autoFocus
        value={draft}
        aria-label={ariaLabel}
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
    );
  }

  return (
    <button
      type="button"
      className="pact-dial-value"
      style={{ color }}
      disabled={disabled}
      aria-label={`${ariaLabel}, ${shown}, click to edit`}
      onClick={() => {
        setDraft(kind === 'score' ? value.toFixed(2) : String(value));
        setEditing(true);
      }}
    >
      {shown}
    </button>
  );
};
