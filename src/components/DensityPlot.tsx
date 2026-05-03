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
  zeroLineColor = '#FF5757',
  fillOpacity = 0.45,
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
    <div className="w-full">
      {showLegend && series.length > 1 && (
        <div className="flex items-center gap-4 mb-2 text-xs font-mono uppercase tracking-widest">
          {series.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: s.color }} />
              <span style={{ color: s.color }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {computed.densities.map((d) => (
            <g key={d.label}>
              <path d={area(d.pts) || ''} fill={d.color} fillOpacity={fillOpacity} />
              <path d={line(d.pts) || ''} stroke={d.color} strokeWidth={1.5} fill="none" />
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
                fontFamily="Space Mono, monospace"
                style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}
              >
                no diff
              </text>
            </>
          )}
          {showAxes && (
            <g transform={`translate(0,${innerH})`}>
              <line x1={0} x2={innerW} y1={0} y2={0} stroke="#44413b" />
              {xTicks.map((t, i) => (
                <g key={i} transform={`translate(${xScale(t)},0)`}>
                  <line y1={0} y2={4} stroke="#44413b" />
                  <text y={16} textAnchor="middle" fontSize={10} fill="#8a8680" fontFamily="Space Mono, monospace">
                    {t.toFixed(2)}
                  </text>
                </g>
              ))}
              {xLabel && (
                <text
                  x={innerW / 2}
                  y={28}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#8a8680"
                  fontFamily="Space Mono, monospace"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}
                >
                  {xLabel}
                </text>
              )}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
