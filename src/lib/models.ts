// The three models' math. They share no state and no results: the only thing
// priority and swing have in common is the arithmetic of a weighted average,
// which is written once here as a pure function of that model's own draws.
import type {
  Interval,
  MoneyCriterion,
  MoneyKind,
  PriorityCriterion,
  SwingCriterion,
  WeightedDraws,
} from '../types';
import { betaDraws, intervalDraws, paramsFor } from './stats';

export interface Summary {
  mean: number;
  lo: number;
  hi: number;
}

function summarize(arr: Float64Array): Summary {
  const n = arr.length;
  const sorted = Float64Array.from(arr).sort();
  let sum = 0;
  for (let i = 0; i < n; i++) sum += arr[i];
  const at = (q: number) => {
    const pos = (n - 1) * q;
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  };
  return { mean: sum / n, lo: at(0.05), hi: at(0.95) };
}

const pGreater = (a: Float64Array, b: Float64Array) => {
  let c = 0;
  for (let i = 0; i < a.length; i++) if (a[i] > b[i]) c++;
  return c / a.length;
};

const betaFor = (location: number, uncertainty: number) => {
  const p = paramsFor(location, uncertainty);
  return betaDraws(p.alpha, p.beta);
};

// ---------- interval editing ----------

export const point = (v: number): Interval => ({ mid: v, lo: v, hi: v });

// Keeps lo <= mid <= hi. Moving the best estimate carries the interval with
// it (so a +/- band stays a +/- band); moving an edge clamps it to mid.
export function updateInterval(
  iv: Interval,
  field: keyof Interval,
  value: number,
  min?: number
): Interval {
  if (field === 'mid') {
    const delta = value - iv.mid;
    let lo = iv.lo + delta;
    if (min !== undefined) lo = Math.max(min, lo);
    return { mid: value, lo: Math.min(lo, value), hi: Math.max(iv.hi + delta, value) };
  }
  if (field === 'lo') return { ...iv, lo: Math.min(value, iv.mid) };
  return { ...iv, hi: Math.max(value, iv.mid) };
}

// ---------- weighted models (priority 0–1 and swing ratings) ----------

export function priorityDraws(c: PriorityCriterion): WeightedDraws {
  return {
    w: betaFor(c.weight, c.weightUncertainty),
    a: betaFor(c.presenceA, c.uncertaintyA),
    b: betaFor(c.presenceB, c.uncertaintyB),
  };
}

export function swingDraws(c: SwingCriterion): WeightedDraws {
  return {
    w: intervalDraws(c.rating, undefined, { min: 0 }),
    a: betaFor(c.positionA, c.uncertaintyA),
    b: betaFor(c.positionB, c.uncertaintyB),
  };
}

export interface WeightedItem extends WeightedDraws {
  id: string;
  name: string;
  // Negative valence: reverse the preference direction (1 - x) before aggregating.
  flip: boolean;
}

export interface WeightedCriterionResult {
  id: string;
  name: string;
  // Share of the A-minus-B score difference this criterion accounts for.
  contribution: Summary;
  // This criterion's weight as a share of the total weight, per draw.
  share: Summary;
  // Leave-one-out: results with this criterion removed and weights renormalized.
  withoutMeanDiff: number | null;
  withoutPAgtB: number | null;
}

export interface WeightedResult {
  scoreA: Float64Array;
  scoreB: Float64Array;
  diff: Float64Array;
  a: Summary;
  b: Summary;
  d: Summary;
  pAgtB: number;
  criteria: WeightedCriterionResult[];
}

// score(option) = SUM(weight_i * value_i) / SUM(weight_i), per Monte Carlo draw.
function weightedScores(items: WeightedItem[], skip = -1) {
  const n = items[0].w.length;
  const A = new Float64Array(n);
  const B = new Float64Array(n);
  for (let d = 0; d < n; d++) {
    let sw = 0;
    let sa = 0;
    let sb = 0;
    for (let i = 0; i < items.length; i++) {
      if (i === skip) continue;
      const it = items[i];
      const w = it.w[d];
      sw += w;
      sa += w * (it.flip ? 1 - it.a[d] : it.a[d]);
      sb += w * (it.flip ? 1 - it.b[d] : it.b[d]);
    }
    A[d] = sw > 0 ? sa / sw : 0.5;
    B[d] = sw > 0 ? sb / sw : 0.5;
  }
  return { A, B };
}

export function weightedResult(items: WeightedItem[]): WeightedResult | null {
  if (items.length === 0) return null;
  const n = items[0].w.length;
  const { A, B } = weightedScores(items);
  const diff = new Float64Array(n);
  for (let d = 0; d < n; d++) diff[d] = A[d] - B[d];

  const sw = new Float64Array(n);
  for (const it of items) for (let d = 0; d < n; d++) sw[d] += it.w[d];

  const criteria = items.map((it, i): WeightedCriterionResult => {
    const contribution = new Float64Array(n);
    const share = new Float64Array(n);
    for (let d = 0; d < n; d++) {
      const a = it.flip ? 1 - it.a[d] : it.a[d];
      const b = it.flip ? 1 - it.b[d] : it.b[d];
      contribution[d] = sw[d] > 0 ? (it.w[d] * (a - b)) / sw[d] : 0;
      share[d] = sw[d] > 0 ? it.w[d] / sw[d] : 0;
    }
    let withoutMeanDiff: number | null = null;
    let withoutPAgtB: number | null = null;
    if (items.length > 1) {
      const rest = weightedScores(items, i);
      let sum = 0;
      for (let d = 0; d < n; d++) sum += rest.A[d] - rest.B[d];
      withoutMeanDiff = sum / n;
      withoutPAgtB = pGreater(rest.A, rest.B);
    }
    return {
      id: it.id,
      name: it.name,
      contribution: summarize(contribution),
      share: summarize(share),
      withoutMeanDiff,
      withoutPAgtB,
    };
  });

  return {
    scoreA: A,
    scoreB: B,
    diff,
    a: summarize(A),
    b: summarize(B),
    d: summarize(diff),
    pAgtB: pGreater(A, B),
    criteria,
  };
}

// ---------- money / willingness-to-pay ----------

// Signed annual-dollar contribution to "A relative to B" for one criterion.
// Positive = A advantage. Never multiplied by anything.
export function moneyDraws(c: MoneyCriterion): Float64Array {
  if (c.kind === 'pairwise') return intervalDraws(c.value);
  const a = intervalDraws(c.amountA);
  const b = intervalDraws(c.amountB);
  const out = new Float64Array(a.length);
  for (let i = 0; i < out.length; i++) {
    out[i] = c.direction === 'cost' ? b[i] - a[i] : a[i] - b[i];
  }
  return out;
}

export interface MoneyItem {
  id: string;
  name: string;
  kind: MoneyKind;
  contribution: Float64Array;
}

export interface MoneyCriterionResult {
  id: string;
  name: string;
  kind: MoneyKind;
  contribution: Summary;
  // Tornado: net value with only this criterion moved to its 5th / 95th percentile.
  netAtLow: number;
  netAtHigh: number;
  // The contribution this criterion would need for expected net value to be $0.
  breakEven: number;
  // Expected net value with this criterion removed.
  netWithout: number;
}

export interface MoneyResult {
  net: Float64Array;
  summary: Summary;
  pPositive: number;
  criteria: MoneyCriterionResult[];
}

export function moneyResult(items: MoneyItem[]): MoneyResult | null {
  if (items.length === 0) return null;
  const n = items[0].contribution.length;
  const net = new Float64Array(n);
  for (const it of items) for (let d = 0; d < n; d++) net[d] += it.contribution[d];
  const summary = summarize(net);
  let positive = 0;
  for (let d = 0; d < n; d++) if (net[d] > 0) positive++;

  const criteria = items.map((it): MoneyCriterionResult => {
    const c = summarize(it.contribution);
    const rest = summary.mean - c.mean;
    return {
      id: it.id,
      name: it.name,
      kind: it.kind,
      contribution: c,
      netAtLow: rest + c.lo,
      netAtHigh: rest + c.hi,
      breakEven: -rest,
      netWithout: rest,
    };
  });

  return { net, summary, pPositive: positive / n, criteria };
}
