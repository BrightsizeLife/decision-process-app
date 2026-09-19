import type { NumberKind } from '../types';

export function formatUsd(value: number): string {
  const rounded = Math.round(Math.abs(value));
  const sign = value < 0 && rounded !== 0 ? '-' : '';
  return `${sign}$${rounded.toLocaleString('en-US')}`;
}

export function formatSignedUsd(value: number): string {
  const rounded = Math.round(Math.abs(value));
  if (rounded === 0) return '$0';
  return `${value < 0 ? '-' : '+'}$${rounded.toLocaleString('en-US')}`;
}

export function formatNumber(value: number, kind: NumberKind, decimals = 2): string {
  if (kind === 'usd') return formatUsd(value);
  if (kind === 'rating') return String(Math.round(value));
  return value.toFixed(decimals);
}

export function formatInterval(lo: number, hi: number, kind: NumberKind, decimals = 2): string {
  return `${formatNumber(lo, kind, decimals)} – ${formatNumber(hi, kind, decimals)}`;
}

export const formatPct = (p: number, digits = 1) => `${(p * 100).toFixed(digits)}%`;

// Strict-ish parse for a user-typed number: strips $, commas, spaces.
// Returns null when the remainder isn't a finite number.
export function parseNumber(text: string): number | null {
  const cleaned = text.replace(/[$,\s]/g, '');
  if (cleaned === '' || cleaned === '-') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
