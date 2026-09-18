export type PresenceUnit = 'probability' | 'usd';

export interface AspectInputs {
  id: string;
  name: string;
  importance: number;
  importanceUncertainty: number;
  presenceUnit: PresenceUnit;
  presenceA: number;
  uncertaintyA: number;
  presenceB: number;
  uncertaintyB: number;
  include: boolean;
  negative: boolean;
}

export interface AspectDraws {
  id: string;
  name: string;
  presenceUnit: PresenceUnit;
  importance: Float64Array;
  presenceA: Float64Array;
  presenceB: Float64Array;
  scoreA: Float64Array;
  scoreB: Float64Array;
  include: boolean;
  negative: boolean;
}

export type TabId = 'space' | 'report' | 'help';
