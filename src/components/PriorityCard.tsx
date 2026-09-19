import React, { useMemo } from 'react';
import type { PriorityCriterion, WeightedDraws } from '../types';
import type { Summary } from '../lib/models';
import { COLORS, dimensionFor } from '../lib/colors';
import { formatPct } from '../lib/format';
import { Dial } from './Dial';
import { CardHeader } from './CardHeader';
import { DrawReadout, TextReadout } from './Readout';
import { DensityPlot, type Series } from './DensityPlot';

interface PriorityCardProps {
  index: number;
  inputs: PriorityCriterion;
  draws: WeightedDraws;
  share?: Summary;
  choiceA: string;
  choiceB: string;
  onChange: (next: PriorityCriterion) => void;
  onRemove: () => void;
}

export const PriorityCard: React.FC<PriorityCardProps> = ({
  index,
  inputs,
  draws,
  share,
  choiceA,
  choiceB,
  onChange,
  onRemove,
}) => {
  const dimension = dimensionFor(index);
  const disabled = !inputs.include;
  const negative = inputs.negative;
  const label = inputs.name || `criterion ${index + 1}`;

  const set = <K extends keyof PriorityCriterion>(key: K, v: PriorityCriterion[K]) =>
    onChange({ ...inputs, [key]: v });

  const series: Series[] = useMemo(
    () => [
      { label: 'Weight', data: draws.w, color: COLORS.culture },
      { label: `Presence ${choiceA}`, data: draws.a, color: COLORS.practices },
      { label: `Presence ${choiceB}`, data: draws.b, color: COLORS.outcomes },
    ],
    [draws, choiceA, choiceB]
  );

  return (
    <div className="pact-aspect-card" data-disabled={disabled ? 'true' : undefined}>
      <CardHeader
        index={index}
        name={inputs.name}
        onName={(v) => set('name', v)}
        include={inputs.include}
        onInclude={(v) => set('include', v)}
        onRemove={onRemove}
      >
        <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            className="pact-checkbox"
            checked={negative}
            onChange={(e) => set('negative', e.target.checked)}
          />
          <span style={{ color: negative ? COLORS.outcomesInk : undefined }}>negative valence</span>
        </label>
      </CardHeader>

      <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="pact-dim-section" data-dimension={dimension}>
            <h3 className="pact-h3">weight</h3>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
              <Dial
                label="weight"
                srLabel={`${label} weight`}
                value={inputs.weight}
                onChange={(v) => set('weight', v)}
              />
              <Dial
                label="uncertainty"
                srLabel={`${label} weight uncertainty`}
                value={inputs.weightUncertainty}
                onChange={(v) => set('weightUncertainty', v)}
              />
            </div>
            <DrawReadout draws={draws.w} kind="score" />
            {share && (
              <TextReadout>
                share of total weight {formatPct(share.mean, 0)} · 90% {formatPct(share.lo, 0)} –{' '}
                {formatPct(share.hi, 0)}
              </TextReadout>
            )}
          </div>

          <div className="pact-dim-section" data-dimension={dimension}>
            <h3 className="pact-h3">presence</h3>
            <div className="space-y-4">
              <div>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
                  <Dial
                    label={`${choiceA} presence`}
                    srLabel={`${label} ${choiceA} presence`}
                    value={inputs.presenceA}
                    onChange={(v) => set('presenceA', v)}
                    negative={negative}
                  />
                  <Dial
                    label={`${choiceA} uncertainty`}
                    srLabel={`${label} ${choiceA} presence uncertainty`}
                    value={inputs.uncertaintyA}
                    onChange={(v) => set('uncertaintyA', v)}
                  />
                </div>
                <DrawReadout draws={draws.a} kind="score" />
              </div>
              <div>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
                  <Dial
                    label={`${choiceB} presence`}
                    srLabel={`${label} ${choiceB} presence`}
                    value={inputs.presenceB}
                    onChange={(v) => set('presenceB', v)}
                    negative={negative}
                  />
                  <Dial
                    label={`${choiceB} uncertainty`}
                    srLabel={`${label} ${choiceB} presence uncertainty`}
                    value={inputs.uncertaintyB}
                    onChange={(v) => set('uncertaintyB', v)}
                  />
                </div>
                <DrawReadout draws={draws.b} kind="score" />
              </div>
            </div>
            {negative && (
              <p className="pact-small pact-signal-text mt-3">
                negative valence: presence is reversed (1 − presence) before it is scored.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-x-4 gap-y-2">
          <label className="pact-anchor">
            <span className="pact-dial-label">presence 0 means</span>
            <input
              type="text"
              className="pact-aspect-name w-full"
              value={inputs.anchorLow}
              placeholder="optional: what a 0 looks like"
              onChange={(e) => set('anchorLow', e.target.value)}
            />
          </label>
          <label className="pact-anchor">
            <span className="pact-dial-label">presence 1 means</span>
            <input
              type="text"
              className="pact-aspect-name w-full"
              value={inputs.anchorHigh}
              placeholder="optional: what a 1 looks like"
              onChange={(e) => set('anchorHigh', e.target.value)}
            />
          </label>
        </div>

        <div className="mt-6">
          <DensityPlot series={series} width={620} height={200} xLabel="weight or presence (0–1)" />
        </div>
      </div>
    </div>
  );
};
