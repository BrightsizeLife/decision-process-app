import React, { useMemo } from 'react';
import type { MoneyCriterion } from '../types';
import { dimensionFor, COLORS } from '../lib/colors';
import { formatSignedUsd, formatUsd } from '../lib/format';
import { interval90, mean } from '../lib/stats';
import { CardHeader } from './CardHeader';
import { IntervalInput } from './IntervalInput';
import { Segmented } from './Segmented';
import { TextReadout } from './Readout';
import { DensityPlot } from './DensityPlot';

interface MoneyCardProps {
  index: number;
  inputs: MoneyCriterion;
  contribution: Float64Array;
  choiceA: string;
  choiceB: string;
  onChange: (next: MoneyCriterion) => void;
  onRemove: () => void;
}

export const MoneyCard: React.FC<MoneyCardProps> = ({
  index,
  inputs,
  contribution,
  choiceA,
  choiceB,
  onChange,
  onRemove,
}) => {
  const dimension = dimensionFor(index);
  const disabled = !inputs.include;
  const label = inputs.name || `criterion ${index + 1}`;

  const set = <K extends keyof MoneyCriterion>(key: K, v: MoneyCriterion[K]) =>
    onChange({ ...inputs, [key]: v });

  const stats = useMemo(() => {
    const [lo, hi] = interval90(contribution);
    let mn = Infinity;
    let mx = -Infinity;
    for (let i = 0; i < contribution.length; i++) {
      if (contribution[i] < mn) mn = contribution[i];
      if (contribution[i] > mx) mx = contribution[i];
    }
    return { m: mean(contribution), lo, hi, spread: mx - mn };
  }, [contribution]);

  const series = useMemo(
    () => [{ label: 'Annual contribution', data: contribution, color: COLORS.primary }],
    [contribution]
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
        <Segmented
          ariaLabel={`${label} type`}
          value={inputs.kind}
          onChange={(v) => set('kind', v)}
          options={[
            { value: 'direct', label: 'direct money' },
            { value: 'pairwise', label: 'pairwise value' },
          ]}
        />
      </CardHeader>

      <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
        <div className="pact-dim-section" data-dimension={dimension}>
          {inputs.kind === 'direct' ? (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                <h3 className="pact-h3 mb-0">actual annual amount for each choice</h3>
                <Segmented
                  ariaLabel={`${label} direction`}
                  value={inputs.direction}
                  onChange={(v) => set('direction', v)}
                  options={[
                    { value: 'cost', label: 'a cost (lower is better)' },
                    { value: 'benefit', label: 'a benefit (higher is better)' },
                  ]}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                <IntervalInput
                  label={`${choiceA} per year`}
                  srLabel={`${label} ${choiceA} annual amount`}
                  value={inputs.amountA}
                  kind="usd"
                  onChange={(v) => set('amountA', v)}
                />
                <IntervalInput
                  label={`${choiceB} per year`}
                  srLabel={`${label} ${choiceB} annual amount`}
                  value={inputs.amountB}
                  kind="usd"
                  onChange={(v) => set('amountB', v)}
                />
              </div>
              <p className="pact-small pact-muted mt-3">
                The model takes the difference directly. No importance weight is applied.
              </p>
            </>
          ) : (
            <>
              <h3 className="pact-h3">annual dollar value of the difference</h3>
              <p className="pact-small pact-muted mb-3">
                Positive = {choiceA} advantage. Negative = {choiceB} advantage. {choiceB} is the
                $0 reference. &quot;I&apos;d pay $5,000/year to make {choiceA} as good as {choiceB}
                &quot; is entered as -$5,000.
              </p>
              <IntervalInput
                label={`value of ${choiceA} relative to ${choiceB}, per year`}
                srLabel={`${label} annual value of ${choiceA} relative to ${choiceB}`}
                value={inputs.value}
                kind="usd"
                onChange={(v) => set('value', v)}
              />
            </>
          )}

          <TextReadout>
            contributes {formatSignedUsd(stats.m)}/yr to {choiceA}&apos;s advantage · 90%{' '}
            {formatSignedUsd(stats.lo)} to {formatSignedUsd(stats.hi)}
          </TextReadout>
        </div>

        {stats.spread > 1 && (
          <div className="mt-6">
            <DensityPlot
              series={series}
              width={620}
              height={140}
              showLegend={false}
              xLabel={`annual contribution to ${choiceA}'s advantage ($)`}
              tickFormat={formatUsd}
              zeroLine
              zeroLabel="$0"
            />
          </div>
        )}
      </div>
    </div>
  );
};
