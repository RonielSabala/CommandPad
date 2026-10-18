import { CodeModelConfig, RUNBOOK_JSON_SCOPES } from "@/common/editorConfig";

/** The model URI for an editor. */
export function modelPath(modelId: string): string {
  const suffix = RUNBOOK_JSON_SCOPES.some((scope) => modelId.startsWith(scope))
    ? CodeModelConfig.RUNBOOK_SUFFIX
    : CodeModelConfig.PLAIN_SUFFIX;

  return `${CodeModelConfig.SCHEME}://${modelId}${suffix}`;
}
