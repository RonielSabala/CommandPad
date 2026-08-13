import { useLayoutEffect } from "react";
import { configureLanguages } from "./languages";
import { publishCodeMetrics } from "./metrics";

/**
 * Resolve the code metrics and register the languages, once, before any editor
 * mounts. */
export function useMonacoBootstrap(): void {
  useLayoutEffect(() => {
    publishCodeMetrics();
    configureLanguages();
  }, []);
}
