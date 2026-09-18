import type { PresenceUnit } from '../types';

export function formatUsd(value: number): string {
  const rounded = Math.round(Math.abs(value));
  const sign = value < 0 && rounded !== 0 ? '-' : '';
  return `${sign}$${rounded.toLocaleString('en-US')}`;
}

// Strict-ish parse for a user-typed $ amount: strips $, commas, spaces.
// Returns null when the remainder isn't a finite number.
export function parseUsd(text: string): number | null {
  const cleaned = text.replace(/[$,\s]/g, '');
  if (cleaned === '' || cleaned === '-') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function formatUnitValue(value: number, unit: PresenceUnit, decimals = 2): string {
  return unit === 'usd' ? formatUsd(value) : value.toFixed(decimals);
}

export function formatUnitInterval(lo: number, hi: number, unit: PresenceUnit, decimals = 2): string {
  const f = (n: number) => (unit === 'usd' ? formatUsd(n) : n.toFixed(decimals));
  return `${f(lo)} – ${f(hi)}`;
}
