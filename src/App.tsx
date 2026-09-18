import React, { useMemo, useState } from 'react';
import type { AspectDraws, AspectInputs, TabId } from './types';
import { betaDraws, mapUsdUncertaintyToSd, normalDraws, paramsFor } from './lib/stats';
import { AspectCard } from './components/AspectCard';
import { ReportTab } from './components/ReportTab';
import { HelpTab } from './components/HelpTab';

const N_ASPECTS = 5;

const defaultAspects = (): AspectInputs[] =>
  Array.from({ length: N_ASPECTS }, (_, i) => ({
    id: `aspect-${i + 1}`,
    name: `Aspect ${i + 1}`,
    importance: 0.5,
    importanceUncertainty: 0.4,
    presenceUnit: 'probability',
    presenceA: 0.5,
    uncertaintyA: 0.5,
    presenceB: 0.5,
    uncertaintyB: 0.5,
    include: i === 0,
    negative: false,
  }));

const presenceDraws = (unit: AspectInputs['presenceUnit'], value: number, uncertainty: number) => {
  if (unit === 'usd') {
    return normalDraws(value, mapUsdUncertaintyToSd(uncertainty, value));
  }
  const p = paramsFor(value, uncertainty);
  return betaDraws(p.alpha, p.beta);
};

const computeDraws = (a: AspectInputs, seed: number): AspectDraws => {
  // seed only used to force re-derivation; we don't actually re-seed Math.random
  void seed;
  const impParams = paramsFor(a.importance, a.importanceUncertainty);
  const importance = betaDraws(impParams.alpha, impParams.beta);
  const presenceA = presenceDraws(a.presenceUnit, a.presenceA, a.uncertaintyA);
  const presenceB = presenceDraws(a.presenceUnit, a.presenceB, a.uncertaintyB);
  const sign = a.negative ? -1 : 1;
  const scoreA = new Float64Array(importance.length);
  const scoreB = new Float64Array(importance.length);
  for (let i = 0; i < importance.length; i++) {
    scoreA[i] = sign * importance[i] * presenceA[i];
    scoreB[i] = sign * importance[i] * presenceB[i];
  }
  return {
    id: a.id,
    name: a.name,
    presenceUnit: a.presenceUnit,
    importance,
    presenceA,
    presenceB,
    scoreA,
    scoreB,
    include: a.include,
    negative: a.negative,
  };
};

const TAB_LABEL: Record<TabId, string> = {
  space: 'decision space',
  report: 'report',
  help: 'how to use',
};

const App: React.FC = () => {
  const [aspects, setAspects] = useState<AspectInputs[]>(defaultAspects);
  const [choiceA, setChoiceA] = useState('Choice A');
  const [choiceB, setChoiceB] = useState('Choice B');
  const [tab, setTab] = useState<TabId>('space');
  const [reseed, setReseed] = useState(0);

  const draws = useMemo<AspectDraws[]>(
    () => aspects.map((a) => computeDraws(a, reseed)),
    [aspects, reseed]
  );

  const updateAspect = (idx: number, next: AspectInputs) => {
    setAspects((prev) => prev.map((a, i) => (i === idx ? next : a)));
  };

  const aName = choiceA.trim() || 'Choice A';
  const bName = choiceB.trim() || 'Choice B';

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
          <p className="cs-kicker">two choices · five aspects · 5,000 simulated worlds</p>
          <h1 className="pact-h1">weigh a decision by its aspects, not your gut.</h1>
          <p className="pact-lede">
            Score how much each aspect matters and how present it is in each choice, with your
            uncertainty built in, then simulate 5,000 possible worlds to see which choice wins and
            how often.
          </p>
        </div>

        <div className="pact-section">
          <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div className="pact-field">
              <label className="pact-field-label" htmlFor="choice-a">
                choice a
              </label>
              <input id="choice-a" className="pact-input" value={choiceA} onChange={(e) => setChoiceA(e.target.value)} />
            </div>
            <div className="pact-field">
              <label className="pact-field-label" htmlFor="choice-b">
                choice b
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

        {tab === 'space' && (
          <div className="pact-section">
            {aspects.map((a, i) => (
              <AspectCard
                key={a.id}
                index={i}
                inputs={a}
                draws={draws[i]}
                choiceA={aName}
                choiceB={bName}
                onChange={(next) => updateAspect(i, next)}
              />
            ))}
          </div>
        )}

        {tab === 'report' && (
          <div className="pact-section">
            <ReportTab aspectDraws={draws} choiceA={aName} choiceB={bName} />
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
