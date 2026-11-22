import { monaco } from "../setup";

export interface VariableOrigin {
  name: string;
  embedded: boolean;
}

export interface VariableCompletion {
  key: string;
  detail: string;
  params: string[];
  origin?: VariableOrigin;
  unused?: boolean;
}

/** An editor's completions, or a function listing them as a suggestion opens. */
export type CompletionSource =
  | VariableCompletion[]
  | (() => VariableCompletion[]);

export function readCompletions(
  source: CompletionSource,
): VariableCompletion[] {
  return typeof source === "function" ? source() : source;
}

/** What each editor offers, keyed by its model. */
export const modelCompletions = new Map<string, CompletionSource>();

/** The key a model path is filed under. */
export function completionModelKey(path: string): string {
  return monaco.Uri.parse(path).toString();
}
