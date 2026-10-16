import { SECRET_MASK } from "@/common/config";
import {
  getTemplateParamNames,
  maskedText,
  type VariableMap,
} from "@/utils/resolution";
import type { VariableCompletion } from "./registry";

/** The entries an editor offers for one runbook's variables. */
export function buildVariableCompletions(
  variableMap: VariableMap,
  secretKeys: Set<string>,
): VariableCompletion[] {
  return Object.keys(variableMap).map((key) => ({
    key,
    detail: secretKeys.has(key)
      ? SECRET_MASK
      : maskedText(variableMap[key], secretKeys),
    params: getTemplateParamNames(variableMap[key].text),
  }));
}
