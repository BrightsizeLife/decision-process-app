import React, { useMemo, useRef, useState } from 'react';
import type {
  ModelId,
  MoneyCriterion,
  PriorityCriterion,
  SwingCriterion,
  TabId,
} from './types';
import {
  moneyDraws,
  moneyResult,
  priorityDraws,
  swingDraws,
  weightedResult,
  type WeightedItem,
} from './lib/models';
import {
  defaultMoney,
  defaultPriority,
  defaultSwing,
  newMoneyCriterion,
  newPriorityCriterion,
  newSwingCriterion,
} from './lib/defaults';
import { PriorityCard } from './components/PriorityCard';
import { MoneyCard } from './components/MoneyCard';
import { SwingCard } from './components/SwingCard';
import { WeightedReport } from './components/WeightedReport';
import { MoneyReport } from './components/MoneyReport';
import { CompareTab } from './components/CompareTab';
import { HelpTab } from './components/HelpTab';
import { Segmented } from './components/Segmented';

const TAB_LABEL: Record<TabId, string> = {
  space: 'decision space',
  report: 'report',
  compare: 'compare models',
  help: 'how to use',
};

const MODEL_BLURB: Record<ModelId, string> = {
  priority:
    'A 0–1 weight for each criterion and a 0–1 presence score for each choice. The result is a dimensionless priority-weighted score.',
  money:
    'Annual dollars only: what each choice actually costs, and what each difference is worth to you. The result is a net annual value.',
  swing:
    'Rate how valuable the full swing from worst to best is on each criterion, then place each choice between those anchors. The result is a swing-weighted 0–1 score.',
};

// Draws are expensive relative to a slider drag, so cache them per criterion
// object: editing one criterion only redraws that one. A re-simulate bumps
// `reseed`, which throws the cache away.
function useCriterionDraws<C extends object, D>(list: C[], compute: (c: C) => D, reseed: number): D[] {
  const cache = useRef<{ reseed: number; map: WeakMap<C, D> }>({ reseed, map: new WeakMap() });
  if (cache.current.reseed !== reseed) cache.current = { reseed, map: new WeakMap() };
  return useMemo(
    () =>
      list.map((c) => {
        let d = cache.current.map.get(c);
        if (d === undefined) {
          d = compute(c);
          cache.current.map.set(c, d);
        }
        return d;
      }),
    [list, reseed]
  );
}

const replaceAt = <T,>(list: T[], i: number, next: T) => list.map((x, j) => (j === i ? next : x));
const removeAt = <T,>(list: T[], i: number) => list.filter((_, j) => j !== i);

const AddButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <p className="mt-4">
    <button type="button" className="pact-cta" onClick={onClick}>
      [add criterion]
    </button>
  </p>
);

const App: React.FC = () => {
  const [model, setModel] = useState<ModelId>('priority');
  const [tab, setTab] = useState<TabId>('space');
  const [choiceA, setChoiceA] = useState('Choice 1');
  const [choiceB, setChoiceB] = useState('Choice 2');
  const [reseed, setReseed] = useState(0);

  // Three independent states. Nothing below reads across them except the
  // compare tab, which only displays each model's own result side by side.
  const [priority, setPriority] = useState<PriorityCriterion[]>(defaultPriority);
  const [money, setMoney] = useState<MoneyCriterion[]>(defaultMoney);
  const [swing, setSwing] = useState<SwingCriterion[]>(defaultSwing);

  const priorityD = useCriterionDraws(priority, priorityDraws, reseed);
  const moneyD = useCriterionDraws(money, moneyDraws, reseed);
  const swingD = useCriterionDraws(swing, swingDraws, reseed);

  const priorityR = useMemo(() => {
    const items: WeightedItem[] = [];
    priority.forEach((c, i) => {
      if (c.include) items.push({ id: c.id, name: c.name || `criterion ${i + 1}`, flip: c.negative, ...priorityD[i] });
    });
    return weightedResult(items);
  }, [priority, priorityD]);

  const swingR = useMemo(() => {
    const items: WeightedItem[] = [];
    swing.forEach((c, i) => {
      if (c.include) items.push({ id: c.id, name: c.name || `criterion ${i + 1}`, flip: false, ...swingD[i] });
    });
    return weightedResult(items);
  }, [swing, swingD]);

  const moneyR = useMemo(() => {
    const items = money.flatMap((c, i) =>
      c.include ? [{ id: c.id, name: c.name || `criterion ${i + 1}`, kind: c.kind, contribution: moneyD[i] }] : []
    );
    return moneyResult(items);
  }, [money, moneyD]);

  const aName = choiceA.trim() || 'Choice 1';
  const bName = choiceB.trim() || 'Choice 2';

  const pickModel = (m: ModelId) => {
    setModel(m);
    if (tab === 'compare' || tab === 'help') setTab('space');
  };

  const shareOf = (r: typeof priorityR, id: string) => r?.criteria.find((c) => c.id === id)?.share;

  return (
    <>
      <a href="#main" className="pact-skip">
        skip to content
      </a>

      <header className="pact-header">
        <div className="pact-page pact-header-inner">
          <span className="pact-wordmark">decision space</span>
          <a
            href="https://github.com/BrightsizeLife/decision-process-app"
            target="_blank"
            rel="noreferrer"
            className="pact-cta"
          >
            [source]
          </a>
        </div>
      </header>

      <main id="main" className="pact-page" style={{ paddingBlock: 'var(--pact-space-4)' }} tabIndex={-1}>
        <div className="pact-section">
          <p className="cs-kicker">two choices · three models · 5,000 simulated worlds</p>
          <h1 className="pact-h1">make your gut show its work, confusion included.</h1>
          <p className="pact-lede">
            Your intuition already leans somewhere, and it is often close to your heart. Put numbers
            on what matters, how each choice measures up, and how unsure you are, then see how your
            own judgments play out across 5,000 simulated worlds.
          </p>
        </div>

        <div className="pact-section">
          <h2 className="cs-kicker">model</h2>
          <Segmented<ModelId>
            ariaLabel="model"
            size="lg"
            value={model}
            onChange={pickModel}
            options={[
              { value: 'priority', label: 'priority 0–1' },
              { value: 'money', label: 'money / WTP' },
              { value: 'swing', label: 'swing ratings' },
            ]}
          />
          <p className="pact-small pact-muted mt-3" style={{ maxWidth: 'var(--pact-measure)' }}>
            {MODEL_BLURB[model]} The three models are computed separately and never combined.
          </p>
        </div>

        <div className="pact-section">
          <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div className="pact-field">
              <label className="pact-field-label" htmlFor="choice-a">
                choice 1
              </label>
              <input id="choice-a" className="pact-input" value={choiceA} onChange={(e) => setChoiceA(e.target.value)} />
            </div>
            <div className="pact-field">
              <label className="pact-field-label" htmlFor="choice-b">
                choice 2
              </label>
              <input id="choice-b" className="pact-input" value={choiceB} onChange={(e) => setChoiceB(e.target.value)} />
            </div>
            <button type="button" onClick={() => setReseed((s) => s + 1)} className="pact-btn">
              [re-simulate]
            </button>
          </div>
        </div>

        <nav className="pact-tabbar" aria-label="sections">
          <ul>
            {(Object.keys(TAB_LABEL) as TabId[]).map((t) => (
              <li key={t}>
                <button
                  type="button"
                  className="pact-tabbtn"
                  aria-current={tab === t ? 'page' : undefined}
                  onClick={() => setTab(t)}
                >
                  {TAB_LABEL[t]}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {tab === 'space' && model === 'priority' && (
          <div className="pact-section">
            <div className="pact-notice mb-4" role="note">
              <p>
                Weights and presence are decision weights you choose, not probabilities. No dollar
                values in this model: if cost matters, enter it as a 0–1 preference score and write
                down what 0 and 1 mean in the anchor boxes.
              </p>
            </div>
            {priority.map((c, i) => (
              <PriorityCard
                key={c.id}
                index={i}
                inputs={c}
                draws={priorityD[i]}
                share={c.include ? shareOf(priorityR, c.id) : undefined}
                choiceA={aName}
                choiceB={bName}
                onChange={(next) => setPriority((l) => replaceAt(l, i, next))}
                onRemove={() => setPriority((l) => removeAt(l, i))}
              />
            ))}
            <AddButton onClick={() => setPriority((l) => [...l, newPriorityCriterion()])} />
          </div>
        )}

        {tab === 'space' && model === 'money' && (
          <div className="pact-section">
            <div className="pact-notice mb-4" role="note">
              <p>
                Everything here is annual dollars. Positive = {aName} advantage, negative = {bName}{' '}
                advantage; {bName} is the $0 reference. No importance weights, no 0–1 scores.
              </p>
            </div>
            {money.map((c, i) => (
              <MoneyCard
                key={c.id}
                index={i}
                inputs={c}
                contribution={moneyD[i]}
                choiceA={aName}
                choiceB={bName}
                onChange={(next) => setMoney((l) => replaceAt(l, i, next))}
                onRemove={() => setMoney((l) => removeAt(l, i))}
              />
            ))}
            <AddButton onClick={() => setMoney((l) => [...l, newMoneyCriterion()])} />
          </div>
        )}

        {tab === 'space' && model === 'swing' && (
          <div className="pact-section">
            {swing.map((c, i) => (
              <SwingCard
                key={c.id}
                index={i}
                inputs={c}
                draws={swingD[i]}
                share={c.include ? shareOf(swingR, c.id) : undefined}
                choiceA={aName}
                choiceB={bName}
                onChange={(next) => setSwing((l) => replaceAt(l, i, next))}
                onRemove={() => setSwing((l) => removeAt(l, i))}
              />
            ))}
            <AddButton onClick={() => setSwing((l) => [...l, newSwingCriterion()])} />
          </div>
        )}

        {tab === 'report' && (
          <div className="pact-section">
            {model === 'priority' && (
              <WeightedReport
                result={priorityR}
                choiceA={aName}
                choiceB={bName}
                scoreName="priority-weighted score"
                weightName="weight"
              />
            )}
            {model === 'money' && <MoneyReport result={moneyR} choiceA={aName} choiceB={bName} />}
            {model === 'swing' && (
              <WeightedReport
                result={swingR}
                choiceA={aName}
                choiceB={bName}
                scoreName="swing-weighted score"
                weightName="swing weight"
              />
            )}
          </div>
        )}

        {tab === 'compare' && (
          <div className="pact-section">
            <CompareTab
              priority={priorityR}
              money={moneyR}
              swing={swingR}
              choiceA={aName}
              choiceB={bName}
              onOpen={(m) => {
                setModel(m);
                setTab('report');
              }}
            />
          </div>
        )}

        {tab === 'help' && (
          <div className="pact-section">
            <HelpTab />
          </div>
        )}
      </main>

      <footer className="pact-footer">
        <div className="pact-page">
          <p>
            ported from{' '}
            <a href="https://github.com/BrightsizeLife/decision-process" target="_blank" rel="noreferrer">
              BrightsizeLife/decision-process
            </a>
            . a cheap sensationalism tool.
          </p>
        </div>
      </footer>
    </>
  );
};

export default App;
