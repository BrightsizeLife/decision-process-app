import React, { useMemo } from 'react';
import type { AspectDraws } from '../types';
import { COLORS } from '../lib/colors';
import { formatUnitValue } from '../lib/format';
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

export const ReportTab: React.FC<ReportTabProps> = ({ aspectDraws, choiceA, choiceB }) => {
  const included = useMemo(() => aspectDraws.filter((a) => a.include), [aspectDraws]);

  if (included.length === 0) {
    return (
      <div className="pact-notice" role="note">
        <p className="pact-h3 mb-1">no aspects included</p>
        <p className="pact-muted">Toggle at least one aspect on to see the analysis.</p>
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
          unit: a.presenceUnit,
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
        color: COLORS.practicesInk,
        dimension: 'practices',
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
        color: COLORS.outcomesInk,
        dimension: 'outcomes',
      };
    }
    return {
      kind: 'close' as const,
      pWithin,
      meanD,
      width: widthD,
    };
  }, [stats, choiceA, choiceB]);

  const topDrivers = useMemo(() => {
    const sorted = [...aspectStats].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    return sorted.slice(0, 2).map((a) => a.name);
  }, [aspectStats]);

  const overallSeries: Series[] = [
    { label: choiceA, data: stats.A, color: COLORS.practices },
    { label: choiceB, data: stats.B, color: COLORS.outcomes },
  ];

  return (
    <div className="space-y-16">
      {/* Decision summary */}
      <section aria-labelledby="decision-h">
        <h2 id="decision-h" className="cs-kicker">
          decision recommendation
        </h2>
        <div style={{ borderTop: '3px solid var(--pact-ink)', paddingTop: 'var(--pact-space-2)' }}>
          {decision.kind === 'winner' ? (
            <>
              <h3 className="pact-h2">
                <span data-dimension={decision.dimension} className="pact-dim-mark" aria-hidden="true" />
                <span style={{ color: decision.color }}>{decision.winner}</span> is{' '}
                {decision.strong ? 'strongly' : 'likely'} the better choice.
              </h3>
              <p className="mt-3">
                <span className="pact-muted">probability</span>{' '}
                <span className="pact-num" style={{ color: decision.color }}>
                  {fmtPct(decision.prob)}
                </span>
                <span className="pact-muted"> · mean advantage </span>
                <span className="pact-num">{fmt3(Math.abs(decision.diff))}</span>
                <span className="pact-muted"> · 90% width </span>
                <span className="pact-num">{fmt3(decision.width)}</span>
              </p>
              {topDrivers.length > 0 && (
                <p className="mt-2 pact-small pact-muted">
                  biggest drivers · <strong className="text-[var(--pact-ink)]">{topDrivers.join(' + ')}</strong>
                </p>
              )}
            </>
          ) : (
            <>
              <h3 className="pact-h2">too close to call.</h3>
              <p className="mt-3">
                {choiceA} and {choiceB} land within 5% of each other{' '}
                <span className="pact-num">{fmtPct(decision.pWithin)}</span> of the time. Mean
                difference is just <span className="pact-num">{fmt3(Math.abs(decision.meanD))}</span>{' '}
                (90% width <span className="pact-num">{fmt3(decision.width)}</span>).
              </p>
              <p className="mt-2 pact-small pact-muted">
                Consider whether other aspects you haven't modeled might tip the balance.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Top stat cards */}
      <section aria-labelledby="numbers-h">
        <h2 id="numbers-h" className="cs-kicker">
          the numbers
        </h2>
        <dl className="pact-stats">
          <div className="pact-stat">
            <dt className="cs-kicker">mean {choiceA}</dt>
            <dd className="pact-num-big" style={{ color: COLORS.practicesInk, fontSize: '1.75rem' }}>
              {fmt3(stats.meanA)}
            </dd>
          </div>
          <div className="pact-stat">
            <dt className="cs-kicker">mean {choiceB}</dt>
            <dd className="pact-num-big" style={{ color: COLORS.outcomesInk, fontSize: '1.75rem' }}>
              {fmt3(stats.meanB)}
            </dd>
          </div>
          <div className="pact-stat">
            <dt className="cs-kicker">mean difference</dt>
            <dd className="pact-num-big" style={{ fontSize: '1.75rem' }}>
              {fmt3(stats.meanD)}
            </dd>
            <div className="pact-small pact-muted">90% width {fmt3(stats.widthD)}</div>
          </div>
          <div className="pact-stat">
            <dt className="cs-kicker">
              p({choiceA} &gt; {choiceB})
            </dt>
            <dd className="pact-num-big" style={{ fontSize: '1.75rem' }}>
              {fmtPct(stats.pAgtB)}
            </dd>
          </div>
          <div className="pact-stat">
            <dt className="cs-kicker">
              p({choiceB} &gt; {choiceA})
            </dt>
            <dd className="pact-num-big" style={{ fontSize: '1.75rem' }}>
              {fmtPct(stats.pBgtA)}
            </dd>
          </div>
          <div className="pact-stat">
            <dt className="cs-kicker">p(within 5%)</dt>
            <dd className="pact-num-big" style={{ fontSize: '1.75rem' }}>
              {fmtPct(stats.pWithin)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Distributions plot */}
      <section aria-labelledby="dist-h">
        <h2 id="dist-h" className="pact-h2">
          score distributions
        </h2>
        <DensityPlot series={overallSeries} width={760} height={260} xLabel="normalized score" />
      </section>

      <section aria-labelledby="diff-h">
        <h2 id="diff-h" className="pact-h2">
          difference ({choiceA} − {choiceB})
        </h2>
        <DensityPlot
          series={[{ label: 'Δ', data: stats.D, color: COLORS.architecture }]}
          width={760}
          height={260}
          showLegend={false}
          xLabel={`${choiceA} − ${choiceB}`}
          zeroLine
          zeroLineColor={COLORS.signal}
        />
      </section>

      {/* Threshold table */}
      <section aria-labelledby="threshold-h">
        <h2 id="threshold-h" className="pact-h2">
          advantage thresholds
        </h2>
        <p className="pact-muted mb-3">Probability that one choice beats the other by at least the given margin.</p>
        <div className="pact-table-wrap" tabIndex={0} aria-label="advantage thresholds by margin">
          <table className="pact-table">
            <thead>
              <tr>
                <th scope="col">margin</th>
                <th scope="col" className="pact-num">
                  {choiceA} ahead
                </th>
                <th scope="col" className="pact-num">
                  {choiceB} ahead
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.thresholdRows.map((row) => (
                <tr key={row.margin}>
                  <td>{row.margin}</td>
                  <td className="pact-num">{fmtPct(row.pA)}</td>
                  <td className="pact-num">{fmtPct(row.pB)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Summary statistics */}
      <section aria-labelledby="summary-h">
        <h2 id="summary-h" className="pact-h2">
          summary statistics
        </h2>
        <div className="pact-table-wrap" tabIndex={0} aria-label="summary statistics by choice">
          <table className="pact-table">
            <thead>
              <tr>
                <th scope="col">choice</th>
                <th scope="col" className="pact-num">
                  mean
                </th>
                <th scope="col" className="pact-num">
                  90% width
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: COLORS.practicesInk }}>{choiceA}</td>
                <td className="pact-num">{fmt3(stats.meanA)}</td>
                <td className="pact-num">{fmt3(stats.widthA)}</td>
              </tr>
              <tr>
                <td style={{ color: COLORS.outcomesInk }}>{choiceB}</td>
                <td className="pact-num">{fmt3(stats.meanB)}</td>
                <td className="pact-num">{fmt3(stats.widthB)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>
                  difference ({choiceA} − {choiceB})
                </td>
                <td className="pact-num">{fmt3(stats.meanD)}</td>
                <td className="pact-num">{fmt3(stats.widthD)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Per-aspect comparison */}
      <section aria-labelledby="per-aspect-h">
        <h2 id="per-aspect-h" className="pact-h2">
          per-aspect comparison
        </h2>
        <p className="pact-muted mb-4">How each aspect leans between the two choices.</p>
        <div className="space-y-8">
          {aspectStats.map((a, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
                <h3 className="pact-h3 mb-0">
                  {a.name}{' '}
                  {a.negative && (
                    <span className="pact-small" style={{ color: COLORS.outcomesInk, fontWeight: 700 }}>
                      [negative valence]
                    </span>
                  )}
                </h3>
                <div className="pact-small pact-num pact-muted">
                  Δ {formatUnitValue(a.diff, a.unit)} · p({choiceA}&gt;{choiceB}) {fmtPct(a.pAgtB)}
                </div>
              </div>
              <DensityPlot
                series={[
                  { label: choiceA, data: a.drawsA, color: COLORS.practices },
                  { label: choiceB, data: a.drawsB, color: COLORS.outcomes },
                ]}
                width={760}
                height={130}
                showLegend={false}
                showAxes={false}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 pact-table-wrap" tabIndex={0} aria-label="per-aspect comparison table">
          <table className="pact-table">
            <thead>
              <tr>
                <th scope="col">aspect</th>
                <th scope="col" className="pact-num">
                  mean {choiceA}
                </th>
                <th scope="col" className="pact-num">
                  mean {choiceB}
                </th>
                <th scope="col" className="pact-num">
                  Δ
                </th>
                <th scope="col" className="pact-num">
                  p({choiceA}&gt;{choiceB})
                </th>
              </tr>
            </thead>
            <tbody>
              {aspectStats.map((a, i) => (
                <tr key={i}>
                  <td>{a.name}</td>
                  <td className="pact-num">{formatUnitValue(a.meanA, a.unit)}</td>
                  <td className="pact-num">{formatUnitValue(a.meanB, a.unit)}</td>
                  <td className="pact-num" style={{ color: a.diff >= 0 ? COLORS.practicesInk : COLORS.outcomesInk }}>
                    {formatUnitValue(a.diff, a.unit)}
                  </td>
                  <td className="pact-num">{fmtPct(a.pAgtB)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
