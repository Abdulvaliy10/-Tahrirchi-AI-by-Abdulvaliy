
export type Language = 'EN' | 'UZ' | 'RU';
export type Operation = 'grammar' | 'simplify';

export interface GrammarError {
  offset: number;
  length: number;
  original: string;
  suggestion: string;
  explanation: string;
}

export interface GrammarResult {
  correctedText: string;
  errors: GrammarError[];
}

export interface SimplifyResult {
  simplifiedText: string;
  summary: string;
}

export interface AnalysisResponse {
  type: Operation;
  result: GrammarResult | SimplifyResult;
}
