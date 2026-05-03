import React, { useMemo } from 'react';
import type { AspectDraws, AspectInputs } from '../types';
import { COLORS, accentFor } from '../lib/colors';
import { Slider } from './Slider';
import { DensityPlot, type Series } from './DensityPlot';
import { mean, width90 } from '../lib/stats';

interface AspectCardProps {
  index: number;
  inputs: AspectInputs;
  draws: AspectDraws;
  choiceA: string;
  choiceB: string;
  onChange: (next: AspectInputs) => void;
}

export const AspectCard: React.FC<AspectCardProps> = ({
  index,
  inputs,
  draws,
  choiceA,
  choiceB,
  onChange,
}) => {
  const accent = accentFor(index);
  const disabled = !inputs.include;
  const negative = inputs.negative;

  const headerColor = negative ? COLORS.coral : accent;

  const set = <K extends keyof AspectInputs>(key: K, v: AspectInputs[K]) =>
    onChange({ ...inputs, [key]: v });

  const series: Series[] = useMemo(
    () => [
      { label: 'Importance', data: draws.importance, color: COLORS.amber },
      { label: `Presence ${choiceA}`, data: draws.presenceA, color: COLORS.cyan },
      { label: `Presence ${choiceB}`, data: draws.presenceB, color: COLORS.coral },
    ],
    [draws, choiceA, choiceB]
  );

  const stats = useMemo(
    () => [
      { label: 'Importance', m: mean(draws.importance), w: width90(draws.importance) },
      { label: `Presence ${choiceA}`, m: mean(draws.presenceA), w: width90(draws.presenceA) },
      { label: `Presence ${choiceB}`, m: mean(draws.presenceB), w: width90(draws.presenceB) },
    ],
    [draws, choiceA, choiceB]
  );

  return (
    <div
      className="border rounded-2xl p-5 mb-5"
      style={{
        borderColor: disabled ? COLORS.dim : `${headerColor}55`,
        background: '#0e1018',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-xs uppercase tracking-widest px-2 py-1 rounded-full border"
            style={{ color: headerColor, borderColor: headerColor }}
          >
            Aspect {String(index + 1).padStart(2, '0')}
          </span>
          <input
            type="text"
            value={inputs.name}
            onChange={(e) => set('name', e.target.value)}
            className="bg-transparent border-b border-[#44413b] focus:border-[#f0ede6] outline-none text-base text-[#f0ede6] font-display italic px-1"
            placeholder={`Aspect ${index + 1}`}
            style={{ color: negative ? COLORS.coral : COLORS.text }}
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="cs-check"
              checked={inputs.include}
              onChange={(e) => set('include', e.target.checked)}
            />
            <span className="text-[#8a8680]">Include</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="cs-check"
              checked={inputs.negative}
              onChange={(e) => set('negative', e.target.checked)}
            />
            <span style={{ color: negative ? COLORS.coral : COLORS.muted }}>Negative</span>
          </label>
        </div>
      </div>

      <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#f0ede6] mb-3">
              Aspect Importance
            </h4>
            <div className="space-y-3 border-l-2 pl-4" style={{ borderColor: COLORS.amber }}>
              <Slider
                label="Importance"
                value={inputs.importance}
                onChange={(v) => set('importance', v)}
              />
              <Slider
                label="Uncertainty"
                value={inputs.importanceUncertainty}
                onChange={(v) => set('importanceUncertainty', v)}
              />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#f0ede6] mb-3">
              Presence
            </h4>
            <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-l-2 pl-4" style={{ borderColor: COLORS.cyan }}>
              <Slider label={`${choiceA} presence`} value={inputs.presenceA} onChange={(v) => set('presenceA', v)} negative={negative} />
              <Slider label={`${choiceA} uncertainty`} value={inputs.uncertaintyA} onChange={(v) => set('uncertaintyA', v)} />
              <Slider label={`${choiceB} presence`} value={inputs.presenceB} onChange={(v) => set('presenceB', v)} negative={negative} />
              <Slider label={`${choiceB} uncertainty`} value={inputs.uncertaintyB} onChange={(v) => set('uncertaintyB', v)} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <DensityPlot series={series} width={620} height={200} xLabel="value" />
        </div>

        <div className="mt-4 text-xs font-mono">
          <div className="grid grid-cols-3 gap-2">
            {stats.map((s, i) => (
              <div
                key={i}
                className="border rounded-lg px-3 py-2"
                style={{ borderColor: COLORS.dim }}
              >
                <div className="uppercase tracking-widest text-[10px] text-[#8a8680] truncate">{s.label}</div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-[#f0ede6] tabular-nums">μ {s.m.toFixed(3)}</span>
                  <span className="text-[#8a8680] tabular-nums">w₉₀ {s.w.toFixed(3)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
