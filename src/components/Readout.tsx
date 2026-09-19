import React from 'react';
import type { NumberKind } from '../types';
import { formatInterval, formatNumber } from '../lib/format';
import { interval90, mean } from '../lib/stats';

// The live judgment interval a setting produces, shown right under the
// controls so you never have to scroll to a chart to see what it means.
export const DrawReadout: React.FC<{ draws: ArrayLike<number>; kind: NumberKind }> = ({ draws, kind }) => {
  const [lo, hi] = interval90(draws);
  return (
    <div className="pact-dial-readout">
      μ {formatNumber(mean(draws), kind)} · judgment interval {formatInterval(lo, hi, kind)}
    </div>
  );
};

export const TextReadout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="pact-dial-readout">{children}</div>
);
