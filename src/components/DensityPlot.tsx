import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { kde, type DensityPoint } from '../lib/stats';

export interface Series {
  label: string;
  data: ArrayLike<number>;
  color: string;
}

interface DensityPlotProps {
  series: Series[];
  width?: number;
  height?: number;
  xLabel?: string;
  domain?: [number, number];
  showLegend?: boolean;
  showAxes?: boolean;
  zeroLine?: boolean;
  zeroLineColor?: string;
  fillOpacity?: number;
  tickFormat?: (n: number) => string;
}

export const DensityPlot: React.FC<DensityPlotProps> = ({
  series,
  width = 600,
  height = 220,
  xLabel,
  domain,
  showLegend = true,
  showAxes = true,
  zeroLine = false,
  zeroLineColor = '#c52012',
  fillOpacity = 0.35,
  tickFormat = (n) => n.toFixed(2),
}) => {
  const margin = { top: 14, right: 14, bottom: showAxes ? 32 : 8, left: 8 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const computed = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    if (domain) {
      lo = domain[0];
      hi = domain[1];
    } else {
      for (const s of series) {
        for (let i = 0; i < s.data.length; i++) {
          if (s.data[i] < lo) lo = s.data[i];
          if (s.data[i] > hi) hi = s.data[i];
        }
      }
      const pad = (hi - lo) * 0.05 || 0.05;
      lo -= pad;
      hi += pad;
    }

    const densities: { label: string; color: string; pts: DensityPoint[] }[] = series.map((s) => ({
      label: s.label,
      color: s.color,
      pts: kde(s.data, { gridSize: 96, min: lo, max: hi }),
    }));

    let maxY = 0;
    for (const d of densities) for (const p of d.pts) if (p.y > maxY) maxY = p.y;
    return { lo, hi, densities, maxY };
  }, [series, domain]);

  const xScale = d3.scaleLinear().domain([computed.lo, computed.hi]).range([0, innerW]);
  const yScale = d3.scaleLinear().domain([0, computed.maxY * 1.05 || 1]).range([innerH, 0]);

  const area = d3
    .area<DensityPoint>()
    .x((d) => xScale(d.x))
    .y0(innerH)
    .y1((d) => yScale(d.y))
    .curve(d3.curveBasis);

  const line = d3
    .line<DensityPoint>()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y))
    .curve(d3.curveBasis);

  const xTicks = xScale.ticks(5);

  return (
    <figure className="pact-chart w-full">
      {showLegend && series.length > 1 && (
        <ul className="pact-legend">
          {series.map((s) => (
            <li key={s.label}>
              <span
                className="inline-block w-3 h-3 rounded-full mr-1.5"
                style={{ background: s.color }}
                aria-hidden="true"
              />
              {s.label}
            </li>
          ))}
        </ul>
      )}
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {computed.densities.map((d) => (
            <g key={d.label}>
              <path d={area(d.pts) || ''} fill={d.color} fillOpacity={fillOpacity} />
              <path d={line(d.pts) || ''} stroke={d.color} strokeWidth={2} fill="none" />
            </g>
          ))}
          {zeroLine && computed.lo <= 0 && computed.hi >= 0 && (
            <>
              <line
                x1={xScale(0)}
                x2={xScale(0)}
                y1={0}
                y2={innerH}
                stroke={zeroLineColor}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <text
                x={xScale(0) + 6}
                y={12}
                fill={zeroLineColor}
                fontSize={10}
                fontFamily="var(--pact-font-num)"
                style={{ textTransform: 'lowercase', letterSpacing: '0.05em', fontWeight: 700 }}
              >
                no diff
              </text>
            </>
          )}
          {showAxes && (
            <g transform={`translate(0,${innerH})`}>
              <line x1={0} x2={innerW} y1={0} y2={0} stroke="#e6e4df" />
              {xTicks.map((t, i) => (
                <g key={i} transform={`translate(${xScale(t)},0)`}>
                  <line y1={0} y2={4} stroke="#e6e4df" />
                  <text y={16} textAnchor="middle" fontSize={10} fill="#5c5a55" fontFamily="var(--pact-font-num)">
                    {tickFormat(t)}
                  </text>
                </g>
              ))}
              {xLabel && (
                <text
                  x={innerW / 2}
                  y={28}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#5c5a55"
                  fontFamily="var(--pact-font-ui)"
                  style={{ textTransform: 'lowercase', letterSpacing: '0.1em' }}
                >
                  {xLabel}
                </text>
              )}
            </g>
          )}
        </g>
      </svg>
    </figure>
  );
};
