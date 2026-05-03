import React, { useMemo, useState } from 'react';
import type { AspectDraws, AspectInputs, TabId } from './types';
import { betaDraws, paramsFor } from './lib/stats';
import { COLORS, accentFor } from './lib/colors';
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
    presenceA: 0.5,
    uncertaintyA: 0.5,
    presenceB: 0.5,
    uncertaintyB: 0.5,
    include: i === 0,
    negative: false,
  }));

const computeDraws = (a: AspectInputs, seed: number): AspectDraws => {
  // seed only used to force re-derivation; we don't actually re-seed Math.random
  void seed;
  const impParams = paramsFor(a.importance, a.importanceUncertainty);
  const presAParams = paramsFor(a.presenceA, a.uncertaintyA);
  const presBParams = paramsFor(a.presenceB, a.uncertaintyB);
  const importance = betaDraws(impParams.alpha, impParams.beta);
  const presenceA = betaDraws(presAParams.alpha, presAParams.beta);
  const presenceB = betaDraws(presBParams.alpha, presBParams.beta);
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
    importance,
    presenceA,
    presenceB,
    scoreA,
    scoreB,
    include: a.include,
    negative: a.negative,
  };
};

const Tab: React.FC<{ active: boolean; onClick: () => void; color: string; children: React.ReactNode }> = ({
  active,
  onClick,
  color,
  children,
}) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 text-xs font-bold tracking-widest uppercase border rounded-full transition-colors`}
    style={{
      color: active ? '#0a0b10' : color,
      borderColor: color,
      background: active ? color : 'transparent',
    }}
  >
    {children}
  </button>
);

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
    <div className="min-h-screen text-[#f0ede6]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <header className="mb-8 border-b pb-6" style={{ borderColor: COLORS.dim }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="font-mono uppercase tracking-widest text-xs text-[#8a8680] mb-2">
                a cheap-sensationalism tool
              </div>
              <h1 className="font-display text-4xl md:text-6xl leading-tight">
                <span className="text-[#f0ede6]">Decision</span>{' '}
                <span style={{ color: COLORS.coral }}>Space</span>
              </h1>
              <p className="font-mono uppercase tracking-widest text-xs text-[#8a8680] mt-3">
                Two choices · Five aspects · Five thousand simulated worlds
              </p>
            </div>
            <a
              href="https://github.com/BrightsizeLife/decision-process-app"
              target="_blank"
              rel="noreferrer"
              className="font-mono uppercase tracking-widest text-xs text-[#8a8680] hover:text-[#f0ede6] transition-colors"
            >
              [ source ]
            </a>
          </div>
        </header>

        {/* Flashing ticker */}
        <div className="mb-8 border border-white/10 rounded-full overflow-hidden h-8 flex items-center animate-flash-bg font-bold tracking-widest text-xs uppercase">
          <div className="flex animate-scroll-slow whitespace-nowrap w-max">
            {Array.from({ length: 8 }).map((_, i) => (
              <React.Fragment key={i}>
                <span className="mx-4">5,000 monte carlo draws</span>
                <span className="mx-2 opacity-50">✦</span>
                <span className="mx-4">beta-distributed beliefs</span>
                <span className="mx-2 opacity-50">✦</span>
                <span className="mx-4">decide louder</span>
                <span className="mx-2 opacity-50">✦</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Choice + tab bar */}
        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 md:gap-4 mb-8">
          <div className="border rounded-2xl p-4" style={{ borderColor: `${COLORS.cyan}55`, background: '#0e1018' }}>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#8a8680] mb-1">Choice A</div>
            <input
              value={choiceA}
              onChange={(e) => setChoiceA(e.target.value)}
              className="w-full bg-transparent text-2xl font-display outline-none"
              style={{ color: COLORS.cyan }}
            />
          </div>
          <div className="border rounded-2xl p-4" style={{ borderColor: `${COLORS.coral}55`, background: '#0e1018' }}>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#8a8680] mb-1">Choice B</div>
            <input
              value={choiceB}
              onChange={(e) => setChoiceB(e.target.value)}
              className="w-full bg-transparent text-2xl font-display outline-none"
              style={{ color: COLORS.coral }}
            />
          </div>
          <button
            onClick={() => setReseed((s) => s + 1)}
            className="px-5 py-3 text-xs font-bold tracking-widest uppercase border rounded-full"
            style={{ color: COLORS.amber, borderColor: COLORS.amber, background: 'transparent' }}
            title="Re-roll the random draws"
          >
            ↻ Re-simulate
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Tab active={tab === 'space'} onClick={() => setTab('space')} color={COLORS.cyan}>
            Decision Space
          </Tab>
          <Tab active={tab === 'report'} onClick={() => setTab('report')} color={COLORS.coral}>
            Report
          </Tab>
          <Tab active={tab === 'help'} onClick={() => setTab('help')} color={COLORS.amber}>
            How to use
          </Tab>
        </div>

        {/* Tab content */}
        {tab === 'space' && (
          <div>
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

        {tab === 'report' && <ReportTab aspectDraws={draws} choiceA={aName} choiceB={bName} />}

        {tab === 'help' && <HelpTab />}

        <footer className="mt-16 pt-8 border-t text-xs font-mono uppercase tracking-widest text-[#8a8680]" style={{ borderColor: COLORS.dim }}>
          <div className="flex justify-between flex-wrap gap-4">
            <span>
              ported from{' '}
              <a
                href="https://github.com/BrightsizeLife/decision-process"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#f0ede6]"
                style={{ color: accentFor(0) }}
              >
                BrightsizeLife/decision-process
              </a>
            </span>
            <span style={{ color: accentFor(2) }}>cheap sensationalism</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
