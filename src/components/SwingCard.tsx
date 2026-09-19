import React, { useMemo } from 'react';
import type { SwingCriterion, WeightedDraws } from '../types';
import type { Summary } from '../lib/models';
import { COLORS, dimensionFor } from '../lib/colors';
import { formatPct } from '../lib/format';
import { Dial } from './Dial';
import { CardHeader } from './CardHeader';
import { IntervalInput } from './IntervalInput';
import { DrawReadout, TextReadout } from './Readout';
import { DensityPlot, type Series } from './DensityPlot';

interface SwingCardProps {
  index: number;
  inputs: SwingCriterion;
  draws: WeightedDraws;
  share?: Summary;
  choiceA: string;
  choiceB: string;
  onChange: (next: SwingCriterion) => void;
  onRemove: () => void;
}

export const SwingCard: React.FC<SwingCardProps> = ({
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
  const label = inputs.name || `criterion ${index + 1}`;

  const set = <K extends keyof SwingCriterion>(key: K, v: SwingCriterion[K]) =>
    onChange({ ...inputs, [key]: v });

  const series: Series[] = useMemo(
    () => [
      { label: `Position ${choiceA}`, data: draws.a, color: COLORS.practices },
      { label: `Position ${choiceB}`, data: draws.b, color: COLORS.outcomes },
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
      />

      <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2 mb-4">
          <label className="pact-anchor">
            <span className="pact-dial-label">worst relevant level (position 0)</span>
            <input
              type="text"
              className="pact-aspect-name w-full"
              value={inputs.worstAnchor}
              placeholder="the worst level you would realistically face"
              onChange={(e) => set('worstAnchor', e.target.value)}
            />
          </label>
          <label className="pact-anchor">
            <span className="pact-dial-label">best relevant level (position 1)</span>
            <input
              type="text"
              className="pact-aspect-name w-full"
              value={inputs.bestAnchor}
              placeholder="the best level you could realistically get"
              onChange={(e) => set('bestAnchor', e.target.value)}
            />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="pact-dim-section" data-dimension={dimension}>
            <h3 className="pact-h3">where each choice sits between the anchors</h3>
            <div className="space-y-4">
              <div>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
                  <Dial
                    label={`${choiceA} position`}
                    srLabel={`${label} ${choiceA} position`}
                    value={inputs.positionA}
                    onChange={(v) => set('positionA', v)}
                  />
                  <Dial
                    label={`${choiceA} uncertainty`}
                    srLabel={`${label} ${choiceA} position uncertainty`}
                    value={inputs.uncertaintyA}
                    onChange={(v) => set('uncertaintyA', v)}
                  />
                </div>
                <DrawReadout draws={draws.a} kind="score" />
              </div>
              <div>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
                  <Dial
                    label={`${choiceB} position`}
                    srLabel={`${label} ${choiceB} position`}
                    value={inputs.positionB}
                    onChange={(v) => set('positionB', v)}
                  />
                  <Dial
                    label={`${choiceB} uncertainty`}
                    srLabel={`${label} ${choiceB} position uncertainty`}
                    value={inputs.uncertaintyB}
                    onChange={(v) => set('uncertaintyB', v)}
                  />
                </div>
                <DrawReadout draws={draws.b} kind="score" />
              </div>
            </div>
          </div>

          <div className="pact-dim-section" data-dimension={dimension}>
            <h3 className="pact-h3">swing rating</h3>
            <p className="pact-small pact-muted mb-3">
              How valuable is the full swing from the worst level to the best level? Give the most
              valuable swing 100 and the rest lower numbers, relative to it.
            </p>
            <IntervalInput
              label="swing rating"
              srLabel={`${label} swing rating`}
              value={inputs.rating}
              kind="rating"
              min={0}
              onChange={(v) => set('rating', v)}
            />
            <DrawReadout draws={draws.w} kind="rating" />
            {share && (
              <TextReadout>
                normalized swing weight {formatPct(share.mean, 0)} · 90% {formatPct(share.lo, 0)} –{' '}
                {formatPct(share.hi, 0)}
              </TextReadout>
            )}
          </div>
        </div>

        <div className="mt-6">
          <DensityPlot series={series} width={620} height={180} xLabel="position between anchors (0–1)" />
        </div>
      </div>
    </div>
  );
};
