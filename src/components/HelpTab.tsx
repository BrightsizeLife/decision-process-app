import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="pact-section" style={{ marginTop: 'var(--pact-space-6)' }}>
    <h2 className="pact-h2">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

export const HelpTab: React.FC = () => (
  <div>
    <p className="cs-kicker">how to use this</p>
    <h1 className="pact-h1">decisions are multiple aspects arguing with each other.</h1>

    <Section title="the purpose">
      <p>
        Complex decisions involve many aspects, each with varying importance and presence across
        your choices. This tool helps you think through the tradeoffs by acknowledging that:
      </p>
      <ul className="pact-rows">
        <li>
          <strong>some aspects matter more than others</strong> <span className="pact-muted">(importance)</span>
        </li>
        <li>
          <strong>each choice exhibits these aspects to different degrees</strong>{' '}
          <span className="pact-muted">(presence)</span>
        </li>
        <li>
          <strong>you're uncertain about both</strong> <span className="pact-muted">(uncertainty)</span>
        </li>
      </ul>
    </Section>

    <Section title="key concepts">
      <h3 className="pact-h3">presence</h3>
      <p>Presence measures how much a choice exhibits a particular aspect. For example:</p>
      <ul className="pact-rows">
        <li>
          If your aspect is "career growth" and choice A offers many advancement opportunities, it
          has <strong>high presence</strong>.
        </li>
        <li>
          If choice B offers limited growth, it has <strong>low presence</strong> for this aspect.
        </li>
      </ul>

      <h3 className="pact-h3" style={{ marginTop: 'var(--pact-space-3)' }}>
        the possible-worlds framework
      </h3>
      <p>Think of uncertainty as exploring possible worlds:</p>
      <ul className="pact-rows">
        <li>
          <strong>zero uncertainty</strong> = only one possible world. You're absolutely certain.
        </li>
        <li>
          <strong>high uncertainty</strong> = many possible worlds. The future could go many ways.
        </li>
      </ul>
      <p>The distribution curves show where you think things will likely end up across these possible worlds.</p>

      <h3 className="pact-h3" style={{ marginTop: 'var(--pact-space-3)' }}>
        judgment interval
      </h3>
      <p>
        Every value + uncertainty dial reports a live <strong>judgment interval</strong> right
        underneath it: the mean (μ) and the middle 90% of simulated outcomes it produces, so you
        can read the effect of a setting without scrolling down to the charts.
      </p>
    </Section>

    <Section title="using the dials">
      <p>Click any number to type an exact value — dragging the slider isn't required. For each aspect, ask yourself:</p>
      <ul className="pact-rows">
        <li>
          <strong>importance</strong>
          <div className="pact-muted italic">"How much does this aspect matter to my overall decision?"</div>
        </li>
        <li>
          <strong>importance uncertainty</strong>
          <div className="pact-muted italic">"How confident am I about this aspect's importance?"</div>
        </li>
        <li>
          <strong>presence (per choice)</strong>
          <div className="pact-muted italic">"To what degree does this choice exhibit this aspect?"</div>
        </li>
        <li>
          <strong>presence uncertainty (per choice)</strong>
          <div className="pact-muted italic">"How confident am I about this assessment?"</div>
        </li>
      </ul>
    </Section>

    <Section title="$ (usd) aspects">
      <p>
        Presence can be switched from a 0–1 probability to a raw dollar amount — useful for an
        aspect like "cost difference" where you want to type an actual figure. Toggle it per
        aspect next to the presence header.
      </p>
      <ul className="pact-rows">
        <li>
          A $ amount can be typed as <strong>negative</strong> directly (e.g. "-500") when a choice
          nets out to a loss on that aspect.
        </li>
        <li>
          <strong>negative valence</strong> is a separate switch — check it when a higher raw
          value is <em>bad</em> for the decision (cost, risk, time-sink), regardless of whether the
          number you typed is itself positive or negative.
        </li>
      </ul>
    </Section>

    <Section title="special features">
      <ul className="pact-rows">
        <li>
          <strong>include</strong> — uncheck to exclude an aspect temporarily (it dims out).
        </li>
        <li>
          <strong>negative valence</strong> — check when high presence is <em>bad</em> (cost, risk,
          time-sink). The aspect will <em>subtract</em> from the score.
        </li>
      </ul>
    </Section>

    <Section title="interpreting results">
      <p>
        The Report tab shows probabilities and confidence intervals based on{' '}
        <strong>5,000 simulated scenarios</strong>. These help you understand not just which choice
        is better, but how confident you can be in that read.
      </p>
    </Section>
  </div>
);
