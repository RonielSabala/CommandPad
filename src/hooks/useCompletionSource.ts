import type { Variable } from "@/common/types";
import {
  buildVariableCompletions,
  type VariableCompletion,
} from "@/monaco/completions";
import { getTabSecretKeys, getTabVariableMap } from "@/utils/resolution";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";

/** A list's completions, built only as a suggestion opens. */
export function useCompletionSource(
  variables: Variable[],
  usedKeys: Set<string>,
): () => VariableCompletion[] {
  const build = useMemo(() => {
    let list: VariableCompletion[] | undefined;

    return () =>
      (list ??= buildVariableCompletions(
        getTabVariableMap(variables),
        getTabSecretKeys(variables),
        usedKeys,
      ));
  }, [variables, usedKeys]);

  const latest = useRef(build);
  useLayoutEffect(() => {
    latest.current = build;
  }, [build]);

  return useCallback(() => latest.current(), []);
}
