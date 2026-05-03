export const COLORS = {
  bg: '#0a0b10',
  text: '#f0ede6',
  muted: '#8a8680',
  dim: '#44413b',
  amber: '#E8E048',
  cyan: '#00D4FF',
  coral: '#FF5757',
  purple: '#B388FF',
  lime: '#06D6A0',
} as const;

export const ACCENT_CYCLE = [
  COLORS.cyan,
  COLORS.amber,
  COLORS.purple,
  COLORS.coral,
  COLORS.lime,
];

export const accentFor = (idx: number) => ACCENT_CYCLE[idx % ACCENT_CYCLE.length];
