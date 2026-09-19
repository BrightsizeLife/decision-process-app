import React from 'react';
import type { ModelId } from '../types';
import type { MoneyResult, WeightedResult } from '../lib/models';
import { formatPct, formatSignedUsd } from '../lib/format';
import { GIVEN } from './Stat';
import { headline } from './MoneyReport';

interface CompareTabProps {
  priority: WeightedResult | null;
  money: MoneyResult | null;
  swing: WeightedResult | null;
  choiceA: string;
  choiceB: string;
  onOpen: (m: ModelId) => void;
}

const f3 = (n: number) => n.toFixed(3);
const signed3 = (n: number) => `${n >= 0 ? '+' : '-'}${Math.abs(n).toFixed(3)}`;

const Column: React.FC<{
  title: string;
  question: string;
  model: ModelId;
  onOpen: (m: ModelId) => void;
  empty: boolean;
  children: React.ReactNode;
}> = ({ title, question, model, onOpen, empty, children }) => (
  <section className="pact-compare-col" aria-label={title}>
    <h3 className="pact-h2" style={{ fontSize: '1.25rem' }}>
      {title}
    </h3>
    <p className="pact-small pact-muted mb-3">{question}</p>
    {empty ? (
      <p className="pact-muted">No criteria included in this model yet.</p>
    ) : (
      <>
        <p className="pact-small pact-muted">{GIVEN}</p>
        {children}
      </>
    )}
    <button type="button" className="pact-cta" onClick={() => onOpen(model)}>
      [open this model]
    </button>
  </section>
);

const Rows: React.FC<{ rows: [string, string][] }> = ({ rows }) => (
  <ul className="pact-rows pact-small my-3">
    {rows.map(([k, v]) => (
      <li key={k} className="flex justify-between gap-3">
        <span className="pact-muted">{k}</span>
        <span className="pact-num">{v}</span>
      </li>
    ))}
  </ul>
);

export const CompareTab: React.FC<CompareTabProps> = ({
  priority,
  money,
  swing,
  choiceA,
  choiceB,
  onOpen,
}) => {
  const weighted = (r: WeightedResult) => (
    <>
      <p className="mt-1">
        {choiceA} scores higher than {choiceB} in <strong>{formatPct(r.pAgtB)}</strong> of simulated worlds.
      </p>
      <Rows
        rows={[
          [`${choiceA} score`, f3(r.a.mean)],
          [`${choiceB} score`, f3(r.b.mean)],
          ['mean difference', signed3(r.d.mean)],
          ['90% interval', `${signed3(r.d.lo)} to ${signed3(r.d.hi)}`],
        ]}
      />
    </>
  );

  return (
    <div>
      <p className="cs-kicker">side by side</p>
      <h2 className="pact-h1" style={{ fontSize: 'var(--pact-text-h2)' }}>
        three models, three separate answers.
      </h2>
      <p className="pact-lede">
        Each model asks a slightly different question and is computed from its own inputs. There is
        no combined score: nothing here is averaged, normalized across, or merged. Read them next to
        each other, not into each other.
      </p>

      <div className="pact-compare mt-8">
        <Column
          title="priority 0–1"
          question="Weighted average of 0–1 presence scores."
          model="priority"
          onOpen={onOpen}
          empty={!priority}
        >
          {priority && weighted(priority)}
        </Column>

        <Column
          title="money / WTP"
          question="Net annual dollars, signed toward one choice."
          model="money"
          onOpen={onOpen}
          empty={!money}
        >
          {money && (
            <>
              <p className="mt-1">
                {headline(choiceA, choiceB, money.summary.mean)}, above $0 in{' '}
                <strong>{formatPct(money.pPositive)}</strong> of simulated worlds.
              </p>
              <Rows
                rows={[
                  ['net annual value', formatSignedUsd(money.summary.mean)],
                  [
                    '90% interval',
                    `${formatSignedUsd(money.summary.lo)} to ${formatSignedUsd(money.summary.hi)}`,
                  ],
                  ['p(net > $0)', formatPct(money.pPositive)],
                ]}
              />
            </>
          )}
        </Column>

        <Column
          title="swing ratings"
          question="Weighted average of positions between worst and best anchors."
          model="swing"
          onOpen={onOpen}
          empty={!swing}
        >
          {swing && weighted(swing)}
        </Column>
      </div>
    </div>
  );
};
