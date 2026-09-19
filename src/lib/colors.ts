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

const DIMENSION_CYCLE = ['practices', 'culture', 'architecture', 'outcomes', 'technology'];

export const dimensionFor = (idx: number) => DIMENSION_CYCLE[idx % DIMENSION_CYCLE.length];
