import React, { useMemo } from 'react';
import type { AspectDraws, AspectInputs, PresenceUnit } from '../types';
import { COLORS } from '../lib/colors';
import { Dial } from './Dial';
import { DensityPlot, type Series } from './DensityPlot';
import { mean, interval90 } from '../lib/stats';
import { formatUnitInterval, formatUnitValue, formatUsd } from '../lib/format';

interface AspectCardProps {
  index: number;
  inputs: AspectInputs;
  draws: AspectDraws;
  choiceA: string;
  choiceB: string;
  onChange: (next: AspectInputs) => void;
}

const dimensionFor = (idx: number) =>
  ['practices', 'culture', 'architecture', 'outcomes', 'technology'][idx % 5];

// "judgment interval" = the live 90% interval a dial's value + uncertainty
// produce, shown right under the controls so you don't have to scroll down
// to the chart to see what a setting means.
const Readout: React.FC<{ draws: ArrayLike<number>; unit: PresenceUnit }> = ({ draws, unit }) => {
  const m = mean(draws);
  const [lo, hi] = interval90(draws);
  return (
    <div className="pact-dial-readout">
      μ {formatUnitValue(m, unit)} · judgment interval {formatUnitInterval(lo, hi, unit)}
    </div>
  );
};

export const AspectCard: React.FC<AspectCardProps> = ({
  index,
  inputs,
  draws,
  choiceA,
  choiceB,
  onChange,
}) => {
  const dimension = dimensionFor(index);
  const disabled = !inputs.include;
  const negative = inputs.negative;
  const unit = inputs.presenceUnit;

  const set = <K extends keyof AspectInputs>(key: K, v: AspectInputs[K]) =>
    onChange({ ...inputs, [key]: v });

  const setUnit = (next: PresenceUnit) => {
    if (next === unit) return;
    // A 0-1 probability and a raw dollar figure don't mean the same thing,
    // so switching units resets the presence values rather than carrying
    // a now-meaningless number across (e.g. 0.66 becoming "$0.66").
    onChange({ ...inputs, presenceUnit: next, presenceA: 0, presenceB: 0 });
  };

  const series: Series[] = useMemo(
    () => [
      { label: 'Importance', data: draws.importance, color: COLORS.culture },
      { label: `Presence ${choiceA}`, data: draws.presenceA, color: COLORS.practices },
      { label: `Presence ${choiceB}`, data: draws.presenceB, color: COLORS.outcomes },
    ],
    [draws, choiceA, choiceB]
  );

  return (
    <div className="pact-aspect-card" data-disabled={disabled ? 'true' : undefined}>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-3">
          <span className="pact-dim-mark" data-dimension={dimension} aria-hidden="true" />
          <span className="cs-kicker">aspect {String(index + 1).padStart(2, '0')}</span>
          <input
            type="text"
            value={inputs.name}
            onChange={(e) => set('name', e.target.value)}
            className="pact-aspect-name"
            placeholder={`Aspect ${index + 1}`}
            aria-label={`aspect ${index + 1} name`}
          />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              className="pact-checkbox"
              checked={inputs.include}
              onChange={(e) => set('include', e.target.checked)}
            />
            <span>include</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              className="pact-checkbox"
              checked={inputs.negative}
              onChange={(e) => set('negative', e.target.checked)}
            />
            <span style={{ color: negative ? COLORS.outcomesInk : undefined }}>
              negative valence
            </span>
          </label>
        </div>
      </div>

      <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Importance */}
          <div className="pact-dim-section" data-dimension={dimension}>
            <h3 className="pact-h3">importance</h3>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
              <Dial
                label="value"
                srLabel={`${inputs.name} importance value`}
                value={inputs.importance}
                onChange={(v) => set('importance', v)}
              />
              <Dial
                label="uncertainty"
                srLabel={`${inputs.name} importance uncertainty`}
                value={inputs.importanceUncertainty}
                onChange={(v) => set('importanceUncertainty', v)}
              />
            </div>
            <Readout draws={draws.importance} unit="probability" />
          </div>

          {/* Presence */}
          <div className="pact-dim-section" data-dimension={dimension}>
            <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
              <h3 className="pact-h3 mb-0">presence</h3>
              <div className="pact-unit-toggle" role="group" aria-label="presence unit">
                <button
                  type="button"
                  aria-pressed={unit === 'probability'}
                  onClick={() => setUnit('probability')}
                >
                  probability
                </button>
                <button type="button" aria-pressed={unit === 'usd'} onClick={() => setUnit('usd')}>
                  $ usd
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
                  <Dial
                    label={`${choiceA} presence`}
                    srLabel={`${inputs.name} ${choiceA} presence`}
                    value={inputs.presenceA}
                    onChange={(v) => set('presenceA', v)}
                    unit={unit}
                    negative={negative}
                  />
                  <Dial
                    label={`${choiceA} uncertainty`}
                    srLabel={`${inputs.name} ${choiceA} uncertainty`}
                    value={inputs.uncertaintyA}
                    onChange={(v) => set('uncertaintyA', v)}
                  />
                </div>
                <Readout draws={draws.presenceA} unit={unit} />
              </div>
              <div>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
                  <Dial
                    label={`${choiceB} presence`}
                    srLabel={`${inputs.name} ${choiceB} presence`}
                    value={inputs.presenceB}
                    onChange={(v) => set('presenceB', v)}
                    unit={unit}
                    negative={negative}
                  />
                  <Dial
                    label={`${choiceB} uncertainty`}
                    srLabel={`${inputs.name} ${choiceB} uncertainty`}
                    value={inputs.uncertaintyB}
                    onChange={(v) => set('uncertaintyB', v)}
                  />
                </div>
                <Readout draws={draws.presenceB} unit={unit} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {unit === 'probability' ? (
            <DensityPlot series={series} width={620} height={200} xLabel="value (0–1)" />
          ) : (
            <>
              <DensityPlot series={[series[0]]} width={620} height={140} xLabel="importance (0–1)" />
              <DensityPlot
                series={[series[1], series[2]]}
                width={620}
                height={200}
                xLabel="presence ($)"
                tickFormat={formatUsd}
                zeroLine
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
