import { SECRET_MASK } from "@/common/config";
import { VariableCompletionConfig } from "@/common/editorConfig";
import {
  getTemplateParamNames,
  maskedText,
  type VariableMap,
} from "@/utils/resolution";
import { abbreviate } from "@/utils/string";
import type { VariableCompletion, VariableOrigin } from "./registry";

/** The entries an editor offers for one runbook's variables. */
export function buildVariableCompletions(
  variableMap: VariableMap,
  secretKeys: Set<string>,
  usedKeys?: Set<string>,
): VariableCompletion[] {
  return Object.keys(variableMap).map((key) => ({
    key,
    detail: secretKeys.has(key)
      ? SECRET_MASK
      : maskedText(variableMap[key], secretKeys),
    params: getTemplateParamNames(variableMap[key].text),
    unused: !!usedKeys && !usedKeys.has(key),
  }));
}

/** The same entries, each naming the runbook they come from. */
export function withOrigin(
  completions: VariableCompletion[],
  origin: VariableOrigin,
): VariableCompletion[] {
  const shownOrigin = {
    ...origin,
    name: abbreviate(origin.name, VariableCompletionConfig.MAX_ORIGIN_LENGTH),
  };

  return completions.map((entry) => ({ ...entry, origin: shownOrigin }));
}
