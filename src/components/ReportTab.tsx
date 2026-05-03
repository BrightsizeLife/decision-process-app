import React, { useMemo } from 'react';
import type { AspectDraws } from '../types';
import { COLORS } from '../lib/colors';
import {
  diffArray,
  mean,
  normalizePair,
  probAdvantage,
  probGreater,
  probWithin,
  sumArrays,
  width90,
} from '../lib/stats';
import { DensityPlot, type Series } from './DensityPlot';

interface ReportTabProps {
  aspectDraws: AspectDraws[];
  choiceA: string;
  choiceB: string;
}

const fmtPct = (p: number) => `${(p * 100).toFixed(1)}%`;
const fmt3 = (n: number) => n.toFixed(3);

const StatCard: React.FC<{ title: React.ReactNode; value: string; subtitle?: string; color?: string }> = ({
  title,
  value,
  subtitle,
  color = COLORS.text,
}) => (
  <div className="border rounded-2xl p-5" style={{ borderColor: COLORS.dim, background: '#0e1018' }}>
    <div className="text-[10px] font-mono uppercase tracking-widest text-[#8a8680] mb-1">{title}</div>
    <div className="font-display text-3xl tabular-nums" style={{ color }}>
      {value}
    </div>
    {subtitle && (
      <div className="text-xs font-mono text-[#8a8680] mt-1">{subtitle}</div>
    )}
  </div>
);

export const ReportTab: React.FC<ReportTabProps> = ({ aspectDraws, choiceA, choiceB }) => {
  const included = useMemo(() => aspectDraws.filter((a) => a.include), [aspectDraws]);

  if (included.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-2xl p-10 text-center" style={{ borderColor: COLORS.dim }}>
        <div className="text-[#8a8680] font-mono uppercase tracking-widest text-xs">No aspects included</div>
        <div className="font-display text-2xl text-[#f0ede6] mt-3">
          Toggle at least one aspect on to see the analysis.
        </div>
      </div>
    );
  }

  const stats = useMemo(() => {
    const sumA = sumArrays(included.map((a) => a.scoreA));
    const sumB = sumArrays(included.map((a) => a.scoreB));
    const { A, B } = normalizePair(sumA, sumB);
    const D = diffArray(A, B);
    const meanA = mean(A);
    const meanB = mean(B);
    const meanD = mean(D);
    const widthA = width90(A);
    const widthB = width90(B);
    const widthD = width90(D);
    const pAgtB = probGreater(A, B);
    const pBgtA = probGreater(B, A);
    const pWithin = probWithin(A, B, 0.05);
    const thresholds = [0.05, 0.1, 0.2, 0.5];
    const thresholdRows = thresholds.map((tau) => ({
      margin: `${(tau * 100).toFixed(0)}%`,
      pA: probAdvantage(A, B, tau),
      pB: probAdvantage(B, A, tau),
    }));
    return { A, B, D, meanA, meanB, meanD, widthA, widthB, widthD, pAgtB, pBgtA, pWithin, thresholdRows };
  }, [included]);

  const aspectStats = useMemo(
    () =>
      included.map((a) => {
        const sA = new Float64Array(a.scoreA.length);
        const sB = new Float64Array(a.scoreB.length);
        for (let i = 0; i < sA.length; i++) {
          sA[i] = a.importance[i] * a.presenceA[i];
          sB[i] = a.importance[i] * a.presenceB[i];
        }
        const diff = diffArray(sA, sB);
        return {
          name: a.name,
          meanA: mean(sA),
          meanB: mean(sB),
          diff: mean(diff),
          pAgtB: probGreater(sA, sB),
          widthA: width90(sA),
          widthB: width90(sB),
          drawsA: sA,
          drawsB: sB,
          negative: a.negative,
        };
      }),
    [included]
  );

  // Decision summary
  const decision = useMemo(() => {
    const { pAgtB, pBgtA, meanD, widthD, pWithin } = stats;
    if (pAgtB > 0.75) {
      return {
        kind: 'winner' as const,
        winner: choiceA,
        prob: pAgtB,
        diff: meanD,
        width: widthD,
        strong: pAgtB > 0.9,
        color: COLORS.lime,
      };
    }
    if (pBgtA > 0.75) {
      return {
        kind: 'winner' as const,
        winner: choiceB,
        prob: pBgtA,
        diff: -meanD,
        width: widthD,
        strong: pBgtA > 0.9,
        color: COLORS.cyan,
      };
    }
    return {
      kind: 'close' as const,
      pWithin,
      meanD,
      width: widthD,
      color: COLORS.amber,
    };
  }, [stats, choiceA, choiceB]);

  const topDrivers = useMemo(() => {
    const sorted = [...aspectStats].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    return sorted.slice(0, 2).map((a) => a.name);
  }, [aspectStats]);

  const overallSeries: Series[] = [
    { label: choiceA, data: stats.A, color: COLORS.cyan },
    { label: choiceB, data: stats.B, color: COLORS.coral },
  ];

  return (
    <div className="space-y-8">
      {/* Decision summary */}
      <div
        className="border-2 rounded-2xl p-6 md:p-8"
        style={{ borderColor: decision.color, background: `${decision.color}10` }}
      >
        <div
          className="text-xs font-mono uppercase tracking-widest mb-3"
          style={{ color: decision.color }}
        >
          ★ Decision Recommendation
        </div>
        {decision.kind === 'winner' ? (
          <>
            <h2 className="font-display text-3xl md:text-5xl text-[#f0ede6] leading-tight">
              <span style={{ color: decision.color }}>{decision.winner}</span>{' '}
              <span className="italic text-[#8a8680]">is {decision.strong ? 'strongly' : 'likely'}</span> the better choice.
            </h2>
            <p className="mt-4 text-[#f0ede6] text-base md:text-lg">
              <span className="font-mono uppercase tracking-widest text-xs text-[#8a8680]">Probability</span>{' '}
              <span className="tabular-nums" style={{ color: decision.color }}>{fmtPct(decision.prob)}</span>{' '}
              <span className="text-[#44413b]">|</span>{' '}
              <span className="font-mono uppercase tracking-widest text-xs text-[#8a8680]">Mean advantage</span>{' '}
              <span className="tabular-nums">{fmt3(Math.abs(decision.diff))}</span>{' '}
              <span className="text-[#44413b]">|</span>{' '}
              <span className="font-mono uppercase tracking-widest text-xs text-[#8a8680]">90% width</span>{' '}
              <span className="tabular-nums">{fmt3(decision.width)}</span>
            </p>
            {topDrivers.length > 0 && (
              <p className="mt-3 text-sm text-[#8a8680] font-mono uppercase tracking-widest">
                Biggest drivers · <span style={{ color: COLORS.amber }}>{topDrivers.join(' + ')}</span>
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="font-display text-3xl md:text-5xl text-[#f0ede6] leading-tight">
              <span style={{ color: decision.color }}>Too close to call.</span>
            </h2>
            <p className="mt-4 text-[#f0ede6] text-base md:text-lg">
              <span style={{ color: COLORS.text }}>{choiceA}</span> and <span style={{ color: COLORS.text }}>{choiceB}</span> land within 5% of each other{' '}
              <span className="tabular-nums" style={{ color: decision.color }}>{fmtPct(decision.pWithin)}</span>{' '}
              of the time. Mean difference is just <span className="tabular-nums">{fmt3(Math.abs(decision.meanD))}</span> (90% width <span className="tabular-nums">{fmt3(decision.width)}</span>).
            </p>
            <p className="mt-3 text-sm text-[#8a8680] italic">
              Consider whether other aspects you haven't modeled might tip the balance.
            </p>
          </>
        )}
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <StatCard title={`Mean ${choiceA}`} value={fmt3(stats.meanA)} color={COLORS.cyan} />
        <StatCard title={`Mean ${choiceB}`} value={fmt3(stats.meanB)} color={COLORS.coral} />
        <StatCard
          title="Mean Difference"
          value={fmt3(stats.meanD)}
          subtitle={`90% width ${fmt3(stats.widthD)}`}
          color={COLORS.purple}
        />
        <StatCard title={`P(${choiceA} > ${choiceB})`} value={fmtPct(stats.pAgtB)} color={COLORS.cyan} />
        <StatCard title={`P(${choiceB} > ${choiceA})`} value={fmtPct(stats.pBgtA)} color={COLORS.coral} />
        <StatCard title="P(within 5%)" value={fmtPct(stats.pWithin)} color={COLORS.amber} />
      </div>

      {/* Distributions plot */}
      <div className="border rounded-2xl p-5 md:p-6" style={{ borderColor: COLORS.dim, background: '#0e1018' }}>
        <div className="text-xs font-mono uppercase tracking-widest text-[#8a8680] mb-3">Score Distributions</div>
        <DensityPlot series={overallSeries} width={760} height={260} xLabel="normalized score" />
      </div>

      <div className="border rounded-2xl p-5 md:p-6" style={{ borderColor: COLORS.dim, background: '#0e1018' }}>
        <div className="text-xs font-mono uppercase tracking-widest text-[#8a8680] mb-3">
          Difference distribution ({choiceA} − {choiceB})
        </div>
        <DensityPlot
          series={[{ label: 'Δ', data: stats.D, color: COLORS.purple }]}
          width={760}
          height={260}
          showLegend={false}
          xLabel={`${choiceA} − ${choiceB}`}
          zeroLine
          zeroLineColor={COLORS.coral}
        />
      </div>

      {/* Threshold table */}
      <div className="border rounded-2xl p-5 md:p-6" style={{ borderColor: COLORS.dim, background: '#0e1018' }}>
        <div className="text-xs font-mono uppercase tracking-widest text-[#8a8680] mb-1">Advantage Thresholds</div>
        <p className="text-sm text-[#8a8680] mb-4">
          Probability that one choice beats the other by at least the given margin.
        </p>
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-[#8a8680] border-b" style={{ borderColor: COLORS.dim }}>
              <th className="text-left py-2 px-2">Margin</th>
              <th className="text-right py-2 px-2" style={{ color: COLORS.cyan }}>{choiceA} ahead</th>
              <th className="text-right py-2 px-2" style={{ color: COLORS.coral }}>{choiceB} ahead</th>
            </tr>
          </thead>
          <tbody>
            {stats.thresholdRows.map((row) => (
              <tr key={row.margin} className="border-b" style={{ borderColor: '#1a1c25' }}>
                <td className="py-3 px-2 text-[#f0ede6]">{row.margin}</td>
                <td className="py-3 px-2 text-right tabular-nums" style={{ color: COLORS.cyan }}>{fmtPct(row.pA)}</td>
                <td className="py-3 px-2 text-right tabular-nums" style={{ color: COLORS.coral }}>{fmtPct(row.pB)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary statistics */}
      <div className="border rounded-2xl p-5 md:p-6" style={{ borderColor: COLORS.dim, background: '#0e1018' }}>
        <div className="text-xs font-mono uppercase tracking-widest text-[#8a8680] mb-3">Summary Statistics</div>
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-[#8a8680] border-b" style={{ borderColor: COLORS.dim }}>
              <th className="text-left py-2 px-2">Choice</th>
              <th className="text-right py-2 px-2">Mean</th>
              <th className="text-right py-2 px-2">90% Width</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b" style={{ borderColor: '#1a1c25' }}>
              <td className="py-3 px-2" style={{ color: COLORS.cyan }}>{choiceA}</td>
              <td className="py-3 px-2 text-right tabular-nums">{fmt3(stats.meanA)}</td>
              <td className="py-3 px-2 text-right tabular-nums">{fmt3(stats.widthA)}</td>
            </tr>
            <tr className="border-b" style={{ borderColor: '#1a1c25' }}>
              <td className="py-3 px-2" style={{ color: COLORS.coral }}>{choiceB}</td>
              <td className="py-3 px-2 text-right tabular-nums">{fmt3(stats.meanB)}</td>
              <td className="py-3 px-2 text-right tabular-nums">{fmt3(stats.widthB)}</td>
            </tr>
            <tr>
              <td className="py-3 px-2" style={{ color: COLORS.purple }}>Difference ({choiceA} − {choiceB})</td>
              <td className="py-3 px-2 text-right tabular-nums">{fmt3(stats.meanD)}</td>
              <td className="py-3 px-2 text-right tabular-nums">{fmt3(stats.widthD)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Per-aspect comparison */}
      <div className="border rounded-2xl p-5 md:p-6" style={{ borderColor: COLORS.dim, background: '#0e1018' }}>
        <div className="text-xs font-mono uppercase tracking-widest text-[#8a8680] mb-1">Per-Aspect Comparison</div>
        <p className="text-sm text-[#8a8680] mb-5">How each aspect leans between the two choices.</p>
        <div className="space-y-6">
          {aspectStats.map((a, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-display text-xl text-[#f0ede6]">
                  {a.name}{' '}
                  {a.negative && (
                    <span className="text-xs font-mono uppercase tracking-widest" style={{ color: COLORS.coral }}>
                      [neg]
                    </span>
                  )}
                </h3>
                <div className="text-xs font-mono text-[#8a8680] tabular-nums">
                  Δ {fmt3(a.diff)} · P({choiceA}&gt;{choiceB}) {fmtPct(a.pAgtB)}
                </div>
              </div>
              <DensityPlot
                series={[
                  { label: choiceA, data: a.drawsA, color: COLORS.cyan },
                  { label: choiceB, data: a.drawsB, color: COLORS.coral },
                ]}
                width={760}
                height={150}
                showLegend={false}
                showAxes={false}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm font-mono min-w-[600px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-[#8a8680] border-b" style={{ borderColor: COLORS.dim }}>
                <th className="text-left py-2 px-2">Aspect</th>
                <th className="text-right py-2 px-2" style={{ color: COLORS.cyan }}>Mean {choiceA}</th>
                <th className="text-right py-2 px-2" style={{ color: COLORS.coral }}>Mean {choiceB}</th>
                <th className="text-right py-2 px-2">Δ</th>
                <th className="text-right py-2 px-2">P({choiceA}&gt;{choiceB})</th>
              </tr>
            </thead>
            <tbody>
              {aspectStats.map((a, i) => (
                <tr key={i} className="border-b" style={{ borderColor: '#1a1c25' }}>
                  <td className="py-2 px-2 text-[#f0ede6]">{a.name}</td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmt3(a.meanA)}</td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmt3(a.meanB)}</td>
                  <td className="py-2 px-2 text-right tabular-nums" style={{ color: a.diff >= 0 ? COLORS.cyan : COLORS.coral }}>
                    {fmt3(a.diff)}
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmtPct(a.pAgtB)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
