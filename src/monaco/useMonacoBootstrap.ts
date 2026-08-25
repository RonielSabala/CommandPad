import { useLayoutEffect } from "react";

import { routeHoversToHoverLayer } from "./hoverLayer";
import { configureLanguages } from "./languages";
import { publishCodeMetrics } from "./metrics";

/**
 * Resolve the code metrics, register the languages and route Monaco's own
 * tooltips out of the editor, once, before any editor mounts. */
export function useMonacoBootstrap(): void {
  useLayoutEffect(() => {
    publishCodeMetrics();
    configureLanguages();
    routeHoversToHoverLayer();
  }, []);
}
