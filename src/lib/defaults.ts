import type { MoneyCriterion, PriorityCriterion, SwingCriterion } from '../types';
import { point } from './models';

let counter = 0;
const newId = () => `criterion-${++counter}`;

export const newPriorityCriterion = (name = ''): PriorityCriterion => ({
  id: newId(),
  name,
  include: true,
  negative: false,
  weight: 0.5,
  weightUncertainty: 0.4,
  presenceA: 0.5,
  uncertaintyA: 0.5,
  presenceB: 0.5,
  uncertaintyB: 0.5,
  anchorLow: '',
  anchorHigh: '',
});

export const newMoneyCriterion = (
  name = '',
  kind: MoneyCriterion['kind'] = 'pairwise'
): MoneyCriterion => ({
  id: newId(),
  name,
  include: true,
  kind,
  direction: 'cost',
  amountA: point(0),
  amountB: point(0),
  value: point(0),
});

export const newSwingCriterion = (name = ''): SwingCriterion => ({
  id: newId(),
  name,
  include: true,
  worstAnchor: '',
  bestAnchor: '',
  positionA: 0.5,
  uncertaintyA: 0.5,
  positionB: 0.5,
  uncertaintyB: 0.5,
  rating: { mid: 50, lo: 50, hi: 50 },
});

// Three blank criteria per model. Names, anchors and amounts are yours to fill in.
const three = <T,>(make: () => T): T[] => [make(), make(), make()];

export const defaultPriority = (): PriorityCriterion[] => three(() => newPriorityCriterion());
export const defaultMoney = (): MoneyCriterion[] => three(() => newMoneyCriterion());
export const defaultSwing = (): SwingCriterion[] => three(() => newSwingCriterion());
