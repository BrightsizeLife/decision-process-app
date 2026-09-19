import React from 'react';
import type { Interval, NumberKind } from '../types';
import { updateInterval } from '../lib/models';
import { EditableNumber } from './EditableNumber';

interface IntervalInputProps {
  label: string;
  srLabel?: string;
  value: Interval;
  onChange: (next: Interval) => void;
  kind: Exclude<NumberKind, 'score'>;
  min?: number;
}

// Best estimate (median) plus a 90% judgment interval, typed directly.
export const IntervalInput: React.FC<IntervalInputProps> = ({
  label,
  srLabel,
  value,
  onChange,
  kind,
  min,
}) => {
  const name = srLabel ?? label;
  const cell = (field: keyof Interval, caption: string) => (
    <div className="pact-interval-cell">
      <span className="pact-interval-caption">{caption}</span>
      <EditableNumber
        value={value[field]}
        kind={kind}
        min={min}
        ariaLabel={`${name}, ${caption}`}
        onCommit={(v) => onChange(updateInterval(value, field, v, min))}
      />
    </div>
  );
  return (
    <div role="group" aria-label={name}>
      <div className="pact-dial-label mb-1">{label}</div>
      <div className="pact-interval">
        {cell('mid', 'best estimate')}
        {cell('lo', 'low (5%)')}
        {cell('hi', 'high (95%)')}
      </div>
    </div>
  );
};
