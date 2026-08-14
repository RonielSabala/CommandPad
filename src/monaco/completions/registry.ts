import { monaco } from "../setup";

export interface VariableCompletion {
  key: string;
  detail: string;
  params: string[];
}

/** What each editor offers, keyed by its model. */
const byModel = new Map<string, VariableCompletion[]>();

/** The key a model path is filed under. */
export function completionModelKey(path: string): string {
  return monaco.Uri.parse(path).toString();
}

export function setModelCompletions(
  key: string,
  completions: VariableCompletion[],
): void {
  byModel.set(key, completions);
}

export function clearModelCompletions(key: string): void {
  byModel.delete(key);
}

export function getModelCompletions(
  key: string,
): VariableCompletion[] | undefined {
  return byModel.get(key);
}
