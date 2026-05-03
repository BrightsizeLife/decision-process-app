import React from 'react';
import { COLORS } from '../lib/colors';

const Section: React.FC<{ title: string; color?: string; children: React.ReactNode }> = ({
  title,
  color = COLORS.amber,
  children,
}) => (
  <section className="mb-10">
    <h2
      className="font-display text-3xl md:text-4xl mb-4"
      style={{ color }}
    >
      {title}
    </h2>
    <div className="text-[#f0ede6] space-y-3 leading-relaxed">{children}</div>
  </section>
);

const Term: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = COLORS.cyan }) => (
  <strong style={{ color }}>{children}</strong>
);

export const HelpTab: React.FC = () => (
  <div className="border rounded-2xl p-6 md:p-10" style={{ borderColor: COLORS.dim, background: '#0e1018' }}>
    <div className="font-mono uppercase tracking-widest text-xs text-[#8a8680] mb-2">how to use this</div>
    <h1 className="font-display text-4xl md:text-6xl text-[#f0ede6] mb-8 leading-tight">
      Decisions are <span style={{ color: COLORS.coral }}>multiple aspects</span> arguing with each other.
    </h1>

    <Section title="The purpose" color={COLORS.amber}>
      <p>
        Complex decisions involve many aspects, each with varying importance and presence across your choices.
        This tool helps you think through the tradeoffs by acknowledging that:
      </p>
      <ul className="list-none space-y-2 pl-0">
        <li>· <Term>Some aspects matter more than others</Term> <span className="text-[#8a8680]">(importance)</span></li>
        <li>· <Term color={COLORS.lime}>Each choice exhibits these aspects to different degrees</Term> <span className="text-[#8a8680]">(presence)</span></li>
        <li>· <Term color={COLORS.purple}>You're uncertain about both</Term> <span className="text-[#8a8680]">(uncertainty)</span></li>
      </ul>
    </Section>

    <Section title="Key concepts" color={COLORS.cyan}>
      <h3 className="font-display text-2xl text-[#f0ede6] mt-2">Presence</h3>
      <p>
        <Term>Presence</Term> measures how much a choice exhibits a particular aspect. For example:
      </p>
      <ul className="list-none space-y-2 pl-0">
        <li>— If your aspect is "Career Growth" and Choice A offers many advancement opportunities, it has <Term color={COLORS.lime}>high presence</Term>.</li>
        <li>— If Choice B offers limited growth, it has <Term color={COLORS.coral}>low presence</Term> for this aspect.</li>
      </ul>

      <h3 className="font-display text-2xl text-[#f0ede6] mt-6">The possible-worlds framework</h3>
      <p>Think of uncertainty as exploring <em>possible worlds</em>:</p>
      <ul className="list-none space-y-2 pl-0">
        <li>— <Term>Zero uncertainty</Term> = only one possible world. You're absolutely certain.</li>
        <li>— <Term color={COLORS.coral}>High uncertainty</Term> = many possible worlds. The future could go many ways.</li>
      </ul>
      <p>
        The distribution curves show where you think things will <em>likely</em> end up across these possible worlds.
      </p>
    </Section>

    <Section title="Using the sliders" color={COLORS.purple}>
      <h3 className="font-display text-2xl text-[#f0ede6]">For each aspect, ask yourself:</h3>
      <div className="space-y-4 mt-3">
        <div>
          <h4 className="font-mono uppercase tracking-widest text-sm text-[#f0ede6]">Importance</h4>
          <p className="italic text-[#8a8680]">"How much does this aspect matter to my overall decision?"</p>
        </div>
        <div>
          <h4 className="font-mono uppercase tracking-widest text-sm text-[#f0ede6]">Importance Uncertainty</h4>
          <p className="italic text-[#8a8680]">"How confident am I about this aspect's importance?"</p>
        </div>
        <div>
          <h4 className="font-mono uppercase tracking-widest text-sm text-[#f0ede6]">Presence (per choice)</h4>
          <p className="italic text-[#8a8680]">"To what degree does this choice exhibit this aspect?"</p>
        </div>
        <div>
          <h4 className="font-mono uppercase tracking-widest text-sm text-[#f0ede6]">Presence Uncertainty (per choice)</h4>
          <p className="italic text-[#8a8680]">"How confident am I about this assessment?"</p>
        </div>
      </div>
    </Section>

    <Section title="Special features" color={COLORS.lime}>
      <ul className="list-none space-y-3 pl-0">
        <li>
          · <Term>Include in analysis</Term> — uncheck to exclude an aspect temporarily (it'll dim out).
        </li>
        <li>
          · <Term color={COLORS.coral}>Negative valence</Term> — check when high presence is <em>bad</em> (cost, risk, time-sink). The aspect will <em>subtract</em> from the score.
        </li>
      </ul>
    </Section>

    <Section title="Interpreting results" color={COLORS.coral}>
      <p>
        The Report tab shows probabilities and confidence intervals based on <Term color={COLORS.amber}>5,000 simulated scenarios</Term>.
        These help you understand not just <em>which</em> choice is better, but <em>how confident</em> you can be in that read.
      </p>
    </Section>
  </div>
);
