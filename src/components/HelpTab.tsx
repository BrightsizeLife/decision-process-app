import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="pact-section" style={{ marginTop: 'var(--pact-space-6)' }}>
    <h2 className="pact-h2">{title}</h2>
    <div className="space-y-3" style={{ maxWidth: 'var(--pact-measure)' }}>
      {children}
    </div>
  </section>
);

export const HelpTab: React.FC = () => (
  <div>
    <p className="cs-kicker">how to use this</p>
    <h1 className="pact-h1">your gut already leans. this makes it show its work.</h1>

    <Section title="what this is for">
      <p>
        This is less a calculator than a way to push your intuition to represent itself, confusion
        included. You put numbers on what matters, how each choice measures up, and how unsure you
        are, and the tool plays out 5,000 ways those judgments could turn out. Often the result
        lands close to what your heart already said. When it doesn't, that gap is worth a look.
      </p>
      <p>
        Whatever a model reports is a statement about your own judgments. It is never an objective
        probability that one choice is actually better.
      </p>
    </Section>

    <Section title="three separate models">
      <p>
        Pick one at the top. Each has its own criteria, inputs and results, and they are never
        combined, averaged or normalized against each other. Use the compare tab to read the
        conclusions side by side afterward.
      </p>
      <ul className="pact-rows">
        <li>
          <strong>priority 0–1</strong>: a weight for each criterion, a 0–1 presence score for each
          choice.
        </li>
        <li>
          <strong>money / WTP</strong>: actual annual dollars, or what a difference is worth to you
          per year.
        </li>
        <li>
          <strong>swing ratings</strong>: how valuable the full swing from worst to best is on each
          criterion.
        </li>
      </ul>
    </Section>

    <Section title="priority 0–1">
      <p>
        Give each criterion a weight from 0 to 1 and each choice a presence score from 0 to 1.
        Weights need not sum to anything; they are normalized internally:
      </p>
      <pre className="pact-formula">score = SUM(weight × presence) / SUM(weight)</pre>
      <ul className="pact-rows">
        <li>
          A weight of 0.95 is a decision weight you chose, not a 95% chance of anything.
        </li>
        <li>
          <strong>negative valence</strong>: check it when high presence is bad (a hassle, a risk).
          Presence is reversed (1 − presence) before it is scored.
        </li>
        <li>
          <strong>no dollar values here.</strong> If cost matters, turn it into a 0–1 preference
          score and write down what 0 and 1 mean in the anchor boxes.
        </li>
      </ul>
      <p>The result is a dimensionless priority-weighted score. It is not dollars and not utility.</p>
    </Section>

    <Section title="money / WTP">
      <p>Two kinds of criterion, both in annual dollars, added into one net value:</p>
      <ul className="pact-rows">
        <li>
          <strong>direct money</strong>: enter the actual annual amount for each choice and say
          whether it is a cost or a benefit. The model takes the difference.
        </li>
        <li>
          <strong>pairwise value</strong>: enter one signed dollar value for the difference between
          the choices. Positive = the first choice's advantage, negative = the second's. The second
          choice is the $0 reference.
        </li>
      </ul>
      <p>
        "I'd pay $5,000 a year to bring the first choice up to the second on this" is entered as
        -$5,000.
      </p>
      <pre className="pact-formula">net value = SUM of signed annual-dollar contributions</pre>
      <p>
        No importance weights, no 0–1 scores, no normalization. A dollar figure is never multiplied
        by an importance score.
      </p>
    </Section>

    <Section title="swing ratings">
      <p>
        For each criterion, name a worst and a best relevant level, then place each choice between
        them (0 = worst, 1 = best). Then rate how valuable that full swing is: 100 for the most
        valuable swing, lower numbers for the others.
      </p>
      <pre className="pact-formula">score = SUM(rating / SUM(ratings) × position)</pre>
      <p>Ratings are normalized internally. Swing ratings are never mixed with the other two models.</p>
    </Section>

    <Section title="the dials">
      <p>
        Click any number to type an exact value; dragging is optional. Under every input a live{' '}
        <strong>judgment interval</strong> shows the mean (μ) and the middle 90% of simulated
        outcomes, so you can see what a setting does without scrolling to the charts.
      </p>
      <p>
        For 0–1 inputs the uncertainty dial widens or narrows that interval. For dollars and swing
        ratings you type the best estimate and the low and high ends of your 90% interval directly.
      </p>
    </Section>

    <Section title="reading the results">
      <p>
        Every probability is phrased "Given the judgments and uncertainty entered into this model…"
        because that is all it is. Sensitivity shows which criteria your conclusion leans on most, and
        what changes if you drop one.
      </p>
    </Section>
  </div>
);
