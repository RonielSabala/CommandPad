import { monaco } from "../setup";

export interface VariableCompletion {
  key: string;
  detail: string;
  params: string[];
}

/** What each editor offers, keyed by its model. */
export const modelCompletions = new Map<string, VariableCompletion[]>();

/** The key a model path is filed under. */
export function completionModelKey(path: string): string {
  return monaco.Uri.parse(path).toString();
}
