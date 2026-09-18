// PACT design tokens (see public/pact/tokens.css) mirrored as JS values for
// inline SVG / style props that can't read CSS custom properties directly.
export const COLORS = {
  bg: '#ffffff',
  text: '#0a0b10',
  muted: '#5c5a55',
  dim: '#e6e4df',
  surface: '#f5f4f0',
  primary: '#4835b4',
  primaryHover: '#381b9d',
  signal: '#c52012',
  signalInk: '#c31d0f',
  // five-dimension categorical set — pop (fill/shape) cuts
  practices: '#00a1cb',
  architecture: '#ad36a7',
  culture: '#dd7c02',
  technology: '#00764c',
  outcomes: '#c52012',
  // ink cuts (text-safe, ~6:1 on white)
  practicesInk: '#026c89',
  architectureInk: '#a52da0',
  cultureInk: '#965202',
  technologyInk: '#007249',
  outcomesInk: '#c31d0f',
  // legacy aliases used across the app: Importance / Choice A / Choice B / diff / include
  amber: '#dd7c02',
  amberInk: '#965202',
  cyan: '#00a1cb',
  cyanInk: '#026c89',
  coral: '#c52012',
  coralInk: '#c31d0f',
  purple: '#ad36a7',
  purpleInk: '#a52da0',
  lime: '#00764c',
  limeInk: '#007249',
} as const;

export const ACCENT_CYCLE = [
  COLORS.practices,
  COLORS.culture,
  COLORS.architecture,
  COLORS.outcomes,
  COLORS.technology,
];

export const ACCENT_INK_CYCLE = [
  COLORS.practicesInk,
  COLORS.cultureInk,
  COLORS.architectureInk,
  COLORS.outcomesInk,
  COLORS.technologyInk,
];

export const accentFor = (idx: number) => ACCENT_CYCLE[idx % ACCENT_CYCLE.length];
export const accentInkFor = (idx: number) => ACCENT_INK_CYCLE[idx % ACCENT_INK_CYCLE.length];
