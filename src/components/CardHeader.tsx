import React from 'react';
import { dimensionFor } from '../lib/colors';

interface CardHeaderProps {
  index: number;
  name: string;
  onName: (v: string) => void;
  include: boolean;
  onInclude: (v: boolean) => void;
  onRemove: () => void;
  children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  index,
  name,
  onName,
  include,
  onInclude,
  onRemove,
  children,
}) => (
  <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <span className="pact-dim-mark" data-dimension={dimensionFor(index)} aria-hidden="true" />
      <span className="cs-kicker whitespace-nowrap">criterion {String(index + 1).padStart(2, '0')}</span>
      <input
        type="text"
        value={name}
        onChange={(e) => onName(e.target.value)}
        className="pact-aspect-name min-w-0 flex-1"
        placeholder={`Criterion ${index + 1}`}
        aria-label={`criterion ${index + 1} name`}
      />
    </div>
    <div className="flex items-center gap-4 text-sm flex-wrap">
      {children}
      <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          className="pact-checkbox"
          checked={include}
          onChange={(e) => onInclude(e.target.checked)}
        />
        <span>include</span>
      </label>
      <button type="button" className="pact-cta" onClick={onRemove} aria-label={`remove ${name || `criterion ${index + 1}`}`}>
        [remove]
      </button>
    </div>
  </div>
);
