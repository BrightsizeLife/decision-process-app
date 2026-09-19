import React from 'react';
import type { WeightedResult } from '../lib/models';
import { COLORS } from '../lib/colors';
import { formatPct } from '../lib/format';
import { DensityPlot } from './DensityPlot';
import { RangeChart } from './RangeChart';
import { GIVEN, Stat } from './Stat';

interface WeightedReportProps {
  result: WeightedResult | null;
  choiceA: string;
  choiceB: string;
  // "priority-weighted score" or "swing-weighted score"
  scoreName: string;
  weightName: string;
}

const f3 = (n: number) => n.toFixed(3);
const signed3 = (n: number) => `${n >= 0 ? '+' : '-'}${Math.abs(n).toFixed(3)}`;

export const WeightedReport: React.FC<WeightedReportProps> = ({
  result,
  choiceA,
  choiceB,
  scoreName,
  weightName,
}) => {
  if (!result) {
    return (
      <div className="pact-notice" role="note">
        <p className="pact-h3 mb-1">no criteria included</p>
        <p className="pact-muted">Add or include at least one criterion to see results.</p>
      </div>
    );
  }
  const { a, b, d, pAgtB, criteria } = result;

  return (
    <div className="space-y-16">
      <section aria-labelledby="w-headline">
        <h2 id="w-headline" className="cs-kicker">
          {scoreName}
        </h2>
        <div style={{ borderTop: '3px solid var(--pact-ink)', paddingTop: 'var(--pact-space-2)' }}>
          <p className="pact-muted">{GIVEN}</p>
          <p className="pact-h2 mt-1">
            {choiceA} scores higher than {choiceB} in{' '}
            <span style={{ color: COLORS.primary }}>{formatPct(pAgtB)}</span>{' '}
            of simulated worlds.
          </p>
          <p className="pact-small pact-muted mt-3" style={{ maxWidth: 'var(--pact-measure)' }}>
            The {scoreName} is a dimensionless 0–1 number built from your own decision weights. It is
            not dollars, not utility, and not an objective probability that either choice is
            actually better.
          </p>
        </div>
      </section>

      <section aria-labelledby="w-numbers">
        <h2 id="w-numbers" className="cs-kicker">
          the numbers
        </h2>
        <dl className="pact-stats">
          <Stat label={`${choiceA} score`} value={f3(a.mean)} color={COLORS.practicesInk} note={`90% ${f3(a.lo)} – ${f3(a.hi)}`} />
          <Stat label={`${choiceB} score`} value={f3(b.mean)} color={COLORS.outcomesInk} note={`90% ${f3(b.lo)} – ${f3(b.hi)}`} />
          <Stat label="mean difference" value={signed3(d.mean)} note={`90% ${signed3(d.lo)} – ${signed3(d.hi)}`} />
          <Stat label={`p(${choiceA} > ${choiceB})`} value={formatPct(pAgtB)} note="share of simulated worlds" />
        </dl>
      </section>

      <section aria-labelledby="w-dist">
        <h2 id="w-dist" className="pact-h2">
          score distributions
        </h2>
        <DensityPlot
          series={[
            { label: choiceA, data: result.scoreA, color: COLORS.practices },
            { label: choiceB, data: result.scoreB, color: COLORS.outcomes },
          ]}
          width={760}
          height={240}
          xLabel={scoreName}
        />
      </section>

      <section aria-labelledby="w-diff">
        <h2 id="w-diff" className="pact-h2">
          difference ({choiceA} − {choiceB})
        </h2>
        <DensityPlot
          series={[{ label: 'Δ', data: result.diff, color: COLORS.architecture }]}
          width={760}
          height={240}
          showLegend={false}
          xLabel={`${choiceA} − ${choiceB}`}
          zeroLine
        />
      </section>

      <section aria-labelledby="w-sens">
        <h2 id="w-sens" className="pact-h2">
          sensitivity to each criterion
        </h2>
        <p className="pact-muted mb-4" style={{ maxWidth: 'var(--pact-measure)' }}>
          How much each criterion pushes the score difference toward {choiceA} (right of zero) or{' '}
          {choiceB} (left), and what happens to the result if you drop it and renormalize the
          remaining {weightName}s.
        </p>
        <RangeChart
          ariaLabel={`Contribution of each criterion to the ${scoreName} difference, with 90% intervals`}
          zeroLabel="no diff"
          format={(n) => n.toFixed(2)}
          rows={criteria.map((c) => ({
            label: c.name,
            lo: c.contribution.lo,
            mid: c.contribution.mean,
            hi: c.contribution.hi,
          }))}
        />
        <div className="pact-table-wrap mt-4" tabIndex={0} aria-label="sensitivity by criterion">
          <table className="pact-table">
            <thead>
              <tr>
                <th scope="col">criterion</th>
                <th scope="col" className="pact-num">
                  share of total {weightName}
                </th>
                <th scope="col" className="pact-num">
                  contribution to difference
                </th>
                <th scope="col" className="pact-num">
                  mean difference without it
                </th>
                <th scope="col" className="pact-num">
                  p({choiceA} &gt; {choiceB}) without it
                </th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td className="pact-num">{formatPct(c.share.mean, 0)}</td>
                  <td className="pact-num">{signed3(c.contribution.mean)}</td>
                  <td className="pact-num">{c.withoutMeanDiff === null ? '—' : signed3(c.withoutMeanDiff)}</td>
                  <td className="pact-num">{c.withoutPAgtB === null ? '—' : formatPct(c.withoutPAgtB)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>all included</td>
                <td className="pact-num">100%</td>
                <td className="pact-num">{signed3(d.mean)}</td>
                <td className="pact-num">{signed3(d.mean)}</td>
                <td className="pact-num">{formatPct(pAgtB)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
};
