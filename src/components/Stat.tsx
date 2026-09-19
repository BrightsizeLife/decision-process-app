import React from 'react';

export const Stat: React.FC<{
  label: React.ReactNode;
  value: React.ReactNode;
  note?: React.ReactNode;
  color?: string;
}> = ({ label, value, note, color }) => (
  <div className="pact-stat">
    <dt className="cs-kicker">{label}</dt>
    <dd className="pact-num-big" style={{ fontSize: '1.75rem', color }}>
      {value}
    </dd>
    {note && <div className="pact-small pact-muted pact-num">{note}</div>}
  </div>
);

export const GIVEN = 'Given the judgments and uncertainty entered into this model,';
