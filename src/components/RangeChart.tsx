import React from 'react';
import * as d3 from 'd3';
import { COLORS } from '../lib/colors';

export interface RangeRow {
  label: string;
  lo: number;
  mid: number;
  hi: number;
}

interface RangeChartProps {
  rows: RangeRow[];
  format: (n: number) => string;
  zeroLabel?: string;
  // Optional vertical reference line (e.g. the expected net value in a tornado).
  baseline?: number;
  ariaLabel: string;
  color?: string;
}

const LABEL_W = 170;
const ROW_H = 30;
const W = 760;

// A dot-and-whisker chart: one row per item, a dot at the middle value and a
// line across its 5%–95% range. The same chart draws per-criterion
// contributions and the sensitivity (tornado) view.
export const RangeChart: React.FC<RangeChartProps> = ({
  rows,
  format,
  zeroLabel = '0',
  baseline,
  ariaLabel,
  color = COLORS.primary,
}) => {
  if (rows.length === 0) return null;
  const values = rows.flatMap((r) => [r.lo, r.mid, r.hi]).concat([0]);
  if (baseline !== undefined) values.push(baseline);
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (hi - lo < 1e-9) {
    lo -= 1;
    hi += 1;
  }
  const pad = (hi - lo) * 0.06;
  const x = d3
    .scaleLinear()
    .domain([lo - pad, hi + pad])
    .range([LABEL_W, W - 16]);
  const ticks = x.ticks(5);
  const height = rows.length * ROW_H + 40;

  return (
    <figure className="pact-chart">
      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={ariaLabel}>
        <line x1={x(0)} x2={x(0)} y1={4} y2={rows.length * ROW_H + 8} stroke={COLORS.signal} strokeDasharray="4 4" />
        <text x={x(0) + 4} y={12} fontSize={10} fill={COLORS.signalInk} fontFamily="var(--pact-font-num)">
          {zeroLabel}
        </text>
        {baseline !== undefined && (
          <line x1={x(baseline)} x2={x(baseline)} y1={4} y2={rows.length * ROW_H + 8} stroke={COLORS.text} strokeWidth={1.5} />
        )}
        {rows.map((r, i) => {
          const y = 22 + i * ROW_H;
          return (
            <g key={i}>
              <text x={LABEL_W - 10} y={y + 4} textAnchor="end" fontSize={12} fill={COLORS.text} fontFamily="var(--pact-font-ui)">
                {r.label.length > 24 ? `${r.label.slice(0, 23)}…` : r.label}
              </text>
              <line x1={x(r.lo)} x2={x(r.hi)} y1={y} y2={y} stroke={color} strokeWidth={3} />
              <line x1={x(r.lo)} x2={x(r.lo)} y1={y - 5} y2={y + 5} stroke={color} strokeWidth={2} />
              <line x1={x(r.hi)} x2={x(r.hi)} y1={y - 5} y2={y + 5} stroke={color} strokeWidth={2} />
              <circle cx={x(r.mid)} cy={y} r={5} fill={COLORS.bg} stroke={color} strokeWidth={2.5} />
            </g>
          );
        })}
        <g transform={`translate(0,${rows.length * ROW_H + 12})`}>
          <line x1={LABEL_W} x2={W - 16} y1={0} y2={0} stroke={COLORS.dim} />
          {ticks.map((t) => (
            <g key={t} transform={`translate(${x(t)},0)`}>
              <line y1={0} y2={4} stroke={COLORS.dim} />
              <text y={16} textAnchor="middle" fontSize={10} fill={COLORS.muted} fontFamily="var(--pact-font-num)">
                {format(t)}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </figure>
  );
};
