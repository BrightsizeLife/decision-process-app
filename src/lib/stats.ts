// Monte Carlo + Beta-distribution helpers — JS port of the R Shiny logic.

const N_DRAWS = 5000;

// Standard normal sample (Box–Muller).
function rnorm(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Marsaglia & Tsang gamma sampler (shape >= 1).
function rgammaShapeGE1(shape: number): number {
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let x: number;
    let v: number;
    do {
      x = rnorm();
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    const x2 = x * x;
    if (u < 1 - 0.0331 * x2 * x2) return d * v;
    if (Math.log(u) < 0.5 * x2 + d * (1 - v + Math.log(v))) return d * v;
  }
}

// Gamma sampler for any shape > 0 (boost for shape < 1 via Stuart's theorem).
function rgamma(shape: number): number {
  if (shape >= 1) return rgammaShapeGE1(shape);
  // shape < 1: sample for shape+1 then multiply by U^(1/shape)
  const g = rgammaShapeGE1(shape + 1);
  const u = Math.random();
  return g * Math.pow(u, 1 / shape);
}

// Beta(alpha, beta) sample.
export function rbeta(alpha: number, beta: number): number {
  const x = rgamma(alpha);
  const y = rgamma(beta);
  return x / (x + y);
}

export function betaDraws(alpha: number, beta: number, n = N_DRAWS): Float64Array {
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = rbeta(alpha, beta);
  return out;
}

// Base concentration (alpha + beta) before the uncertainty scale is applied.
const BASE_CONCENTRATION = 21;

// v ∈ [0,1]: mean/concentration parameterization, so the resulting Beta's
// mean is always exactly v. (The previous `alpha = 1+19v, beta = 20-19v`
// mapping only hit the right mean at v=0.5 — everywhere else alpha+beta
// summed to a constant 21 but the +1/+1 floor shrank the mean toward 0.5,
// e.g. v=0.79 rendered as a mean of ~0.76, v=1.0 as ~0.95.)
export function mapLocationToAB(v: number): { alpha: number; beta: number } {
  const mean = Math.min(0.999, Math.max(0.001, v));
  return { alpha: mean * BASE_CONCENTRATION, beta: (1 - mean) * BASE_CONCENTRATION };
}

// v ∈ [0,1]: 0 -> very tight (high concentration), 1 -> very loose. Log-interp.
export function mapUncertaintyScale(v: number): number {
  const tight = 400;
  const loose = 0.02;
  return Math.exp(Math.log(tight) + (Math.log(loose) - Math.log(tight)) * v);
}

// Build (alpha, beta) for a (location, uncertainty) pair.
export function paramsFor(location: number, uncertainty: number) {
  const ab = mapLocationToAB(location);
  const scale = mapUncertaintyScale(uncertainty);
  return { alpha: ab.alpha * scale, beta: ab.beta * scale };
}

// Z for the 95th percentile of a standard normal.
const Z95 = 1.6448536269514722;

// Draws from a best estimate (median) plus a 90% judgment interval. Each
// side of the median is a half-normal scaled so the 5th and 95th percentiles
// land exactly on lo and hi, so the interval need not be symmetric.
export function intervalDraws(
  iv: { mid: number; lo: number; hi: number },
  n = N_DRAWS,
  opts: { min?: number } = {}
): Float64Array {
  const sLow = Math.max(0, iv.mid - iv.lo) / Z95;
  const sHigh = Math.max(0, iv.hi - iv.mid) / Z95;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const z = rnorm();
    let v = iv.mid + z * (z < 0 ? sLow : sHigh);
    if (opts.min !== undefined && v < opts.min) v = opts.min;
    out[i] = v;
  }
  return out;
}

// ---------- summary stats ----------

export function mean(arr: ArrayLike<number>): number {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

export function quantile(arr: ArrayLike<number>, q: number): number {
  // sorted-copy quantile (linear interp). Caller should pre-sort if reused.
  const sorted = Float64Array.from(arr as ArrayLike<number>);
  Array.prototype.sort.call(sorted, (a: number, b: number) => a - b);
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function width90(arr: ArrayLike<number>): number {
  return quantile(arr, 0.95) - quantile(arr, 0.05);
}

export function interval90(arr: ArrayLike<number>): [number, number] {
  return [quantile(arr, 0.05), quantile(arr, 0.95)];
}

// Probability that arrA[i] > arrB[i].
export function probGreater(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let c = 0;
  for (let i = 0; i < a.length; i++) if (a[i] > b[i]) c++;
  return c / a.length;
}

// ---------- KDE for plots ----------

function gaussKernel(u: number): number {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
}

// Silverman's rule-of-thumb bandwidth.
function bandwidth(arr: ArrayLike<number>): number {
  const n = arr.length;
  const m = mean(arr);
  let sq = 0;
  for (let i = 0; i < n; i++) {
    const d = arr[i] - m;
    sq += d * d;
  }
  const sd = Math.sqrt(sq / (n - 1));
  const iqr = quantile(arr, 0.75) - quantile(arr, 0.25);
  const sigma = Math.min(sd, iqr / 1.34);
  return 1.06 * (sigma > 0 ? sigma : sd > 0 ? sd : 0.05) * Math.pow(n, -1 / 5);
}

export interface DensityPoint { x: number; y: number; }

export function kde(
  arr: ArrayLike<number>,
  opts: { gridSize?: number; min?: number; max?: number; bw?: number } = {}
): DensityPoint[] {
  const n = arr.length;
  if (n === 0) return [];
  const gridSize = opts.gridSize ?? 80;
  let lo = opts.min;
  let hi = opts.max;
  if (lo === undefined || hi === undefined) {
    let mn = Infinity;
    let mx = -Infinity;
    for (let i = 0; i < n; i++) {
      if (arr[i] < mn) mn = arr[i];
      if (arr[i] > mx) mx = arr[i];
    }
    const pad = (mx - mn) * 0.05 || 0.05;
    if (lo === undefined) lo = mn - pad;
    if (hi === undefined) hi = mx + pad;
  }
  const bw = opts.bw ?? bandwidth(arr);
  const step = (hi - lo) / (gridSize - 1);
  const out: DensityPoint[] = new Array(gridSize);
  for (let g = 0; g < gridSize; g++) {
    const x = lo + g * step;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += gaussKernel((x - arr[i]) / bw);
    out[g] = { x, y: sum / (n * bw) };
  }
  return out;
}

export function diffArray(a: Float64Array, b: Float64Array): Float64Array {
  const out = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] - b[i];
  return out;
}
