import React from 'react';
import type { MoneyResult } from '../lib/models';
import { COLORS } from '../lib/colors';
import { formatPct, formatSignedUsd, formatUsd } from '../lib/format';
import { DensityPlot } from './DensityPlot';
import { RangeChart } from './RangeChart';
import { GIVEN, Stat } from './Stat';

interface MoneyReportProps {
  result: MoneyResult | null;
  choiceA: string;
  choiceB: string;
}

// e.g. "Choice 1 comes out $2,000 a year behind Choice 2"
export const headline = (a: string, b: string, net: number) =>
  Math.round(net) === 0
    ? `${a} comes out about even with ${b}`
    : `${a} comes out ${formatUsd(Math.abs(net))} a year ${net > 0 ? 'ahead of' : 'behind'} ${b}`;

export const MoneyReport: React.FC<MoneyReportProps> = ({ result, choiceA, choiceB }) => {
  if (!result) {
    return (
      <div className="pact-notice" role="note">
        <p className="pact-h3 mb-1">no criteria included</p>
        <p className="pact-muted">Add or include at least one criterion to see results.</p>
      </div>
    );
  }
  const { summary, pPositive, criteria } = result;
  const net = summary.mean;
  const swing = [...criteria].sort(
    (x, y) => y.netAtHigh - y.netAtLow - (x.netAtHigh - x.netAtLow)
  );

  return (
    <div className="space-y-16">
      <section aria-labelledby="m-headline">
        <h2 id="m-headline" className="cs-kicker">
          net annual value, {choiceA} relative to {choiceB}
        </h2>
        <div style={{ borderTop: '3px solid var(--pact-ink)', paddingTop: 'var(--pact-space-2)' }}>
          <p className="pact-muted">{GIVEN}</p>
          <p className="pact-h2 mt-1">
            {headline(choiceA, choiceB, net)}, and its net value is above $0 in{' '}
            <span style={{ color: COLORS.primary }}>{formatPct(pPositive)}</span> of simulated worlds.
          </p>
          <p className="mt-3" style={{ maxWidth: 'var(--pact-measure)' }}>
            {Math.round(net) === 0
              ? `${choiceA} and ${choiceB} are worth about the same per year.`
              : net > 0
                ? `${choiceA} breaks even if it cost ${formatUsd(net)} a year more.`
                : `${choiceA} breaks even if it cost ${formatUsd(-net)} a year less.`}
          </p>
          <p className="pact-small pact-muted mt-3" style={{ maxWidth: 'var(--pact-measure)' }}>
            Positive = {choiceA} advantage, negative = {choiceB} advantage. This is a sum of your
            own annual-dollar judgments. There are no importance weights and no 0–1 scores in this
            model, and it is not an objective probability that either choice is actually better.
          </p>
        </div>
      </section>

      <section aria-labelledby="m-numbers">
        <h2 id="m-numbers" className="cs-kicker">
          the numbers
        </h2>
        <dl className="pact-stats">
          <Stat label="net annual value" value={formatSignedUsd(net)} note={`per year, ${choiceA} vs ${choiceB}`} />
          <Stat
            label="90% judgment interval"
            value={`${formatSignedUsd(summary.lo)} to ${formatSignedUsd(summary.hi)}`}
          />
          <Stat label="p(net > $0)" value={formatPct(pPositive)} note="share of simulated worlds" />
        </dl>
      </section>

      <section aria-labelledby="m-dist">
        <h2 id="m-dist" className="pact-h2">
          net value distribution
        </h2>
        <DensityPlot
          series={[{ label: 'Net annual value', data: result.net, color: COLORS.primary }]}
          width={760}
          height={240}
          showLegend={false}
          xLabel={`net annual value of ${choiceA} relative to ${choiceB} ($/year)`}
          tickFormat={formatUsd}
          zeroLine
          zeroLabel="break-even"
        />
      </section>

      <section aria-labelledby="m-contrib">
        <h2 id="m-contrib" className="pact-h2">
          contribution of each criterion
        </h2>
        <p className="pact-muted mb-4" style={{ maxWidth: 'var(--pact-measure)' }}>
          Each row is the signed annual dollars that criterion adds to {choiceA}&apos;s advantage
          (dot = mean, line = 90% interval). They add up to the net value.
        </p>
        <RangeChart
          ariaLabel="Annual dollar contribution of each criterion, with 90% intervals"
          zeroLabel="$0"
          format={formatUsd}
          rows={criteria.map((c) => ({
            label: c.name,
            lo: c.contribution.lo,
            mid: c.contribution.mean,
            hi: c.contribution.hi,
          }))}
        />
      </section>

      <section aria-labelledby="m-break">
        <h2 id="m-break" className="pact-h2">
          break-even
        </h2>
        <p className="pact-muted mb-4" style={{ maxWidth: 'var(--pact-measure)' }}>
          Holding everything else at its mean, the annual contribution each criterion would need for
          the net value to be exactly $0.
        </p>
        <div className="pact-table-wrap" tabIndex={0} aria-label="break-even by criterion">
          <table className="pact-table">
            <thead>
              <tr>
                <th scope="col">criterion</th>
                <th scope="col">type</th>
                <th scope="col" className="pact-num">
                  contribution now
                </th>
                <th scope="col" className="pact-num">
                  needed to break even
                </th>
                <th scope="col" className="pact-num">
                  net without it
                </th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.kind === 'direct' ? 'direct money' : 'pairwise value'}</td>
                  <td className="pact-num">{formatSignedUsd(c.contribution.mean)}</td>
                  <td className="pact-num">{formatSignedUsd(c.breakEven)}</td>
                  <td className="pact-num">{formatSignedUsd(c.netWithout)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>net</td>
                <td />
                <td className="pact-num">{formatSignedUsd(net)}</td>
                <td className="pact-num">$0</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section aria-labelledby="m-sens">
        <h2 id="m-sens" className="pact-h2">
          sensitivity
        </h2>
        <p className="pact-muted mb-4" style={{ maxWidth: 'var(--pact-measure)' }}>
          Net value if only one criterion moves across its own 90% interval and everything else
          stays at its mean. Wider rows matter more. The black line is the current net value.
        </p>
        <RangeChart
          ariaLabel="Net annual value as each criterion moves across its 90% interval"
          zeroLabel="break-even"
          format={formatUsd}
          baseline={net}
          rows={swing.map((c) => ({
            label: c.name,
            lo: c.netAtLow,
            mid: net,
            hi: c.netAtHigh,
          }))}
        />
        <div className="pact-table-wrap mt-4" tabIndex={0} aria-label="sensitivity by criterion">
          <table className="pact-table">
            <thead>
              <tr>
                <th scope="col">criterion</th>
                <th scope="col" className="pact-num">
                  net at its low end
                </th>
                <th scope="col" className="pact-num">
                  net at its high end
                </th>
                <th scope="col" className="pact-num">
                  swing
                </th>
              </tr>
            </thead>
            <tbody>
              {swing.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td className="pact-num">{formatSignedUsd(c.netAtLow)}</td>
                  <td className="pact-num">{formatSignedUsd(c.netAtHigh)}</td>
                  <td className="pact-num">{formatUsd(c.netAtHigh - c.netAtLow)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
