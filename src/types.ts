// Three independent models. Nothing here is shared between them on purpose:
// each has its own criterion type, its own inputs, and its own results.
export type ModelId = 'priority' | 'money' | 'swing';

export type TabId = 'space' | 'report' | 'compare' | 'help';

export type NumberKind = 'score' | 'usd' | 'rating';

// A best estimate (median) with a 90% judgment interval: lo = 5th
// percentile, hi = 95th percentile. Invariant: lo <= mid <= hi.
export interface Interval {
  mid: number;
  lo: number;
  hi: number;
}

// Model 1 — priority-weighted 0–1. Weights and presence are decision
// weights, not probabilities. No dollar values live in this model.
export interface PriorityCriterion {
  id: string;
  name: string;
  include: boolean;
  negative: boolean;
  weight: number;
  weightUncertainty: number;
  presenceA: number;
  uncertaintyA: number;
  presenceB: number;
  uncertaintyB: number;
  anchorLow: string;
  anchorHigh: string;
}

// Model 2 — money / willingness-to-pay. Every criterion contributes a
// signed annual-dollar amount to "A relative to B". No weights, no 0–1.
export type MoneyKind = 'direct' | 'pairwise';

export interface MoneyCriterion {
  id: string;
  name: string;
  include: boolean;
  kind: MoneyKind;
  // direct only: is the amount a cost (lower is better) or a benefit?
  direction: 'cost' | 'benefit';
  amountA: Interval;
  amountB: Interval;
  // pairwise only: signed $/year, positive = A advantage, B is the $0 reference
  value: Interval;
}

// Model 3 — swing ratings. Positions sit between a worst and a best anchor;
// each criterion carries a relative rating for that full swing.
export interface SwingCriterion {
  id: string;
  name: string;
  include: boolean;
  worstAnchor: string;
  bestAnchor: string;
  positionA: number;
  uncertaintyA: number;
  positionB: number;
  uncertaintyB: number;
  rating: Interval;
}

export interface WeightedDraws {
  w: Float64Array;
  a: Float64Array;
  b: Float64Array;
}
