export interface CodeProblem {
  message: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
}

export type CodeValidator = (text: string) => CodeProblem[];
