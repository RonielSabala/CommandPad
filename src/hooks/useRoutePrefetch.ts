import { ROUTE_PREFETCH_TIMEOUT_MS } from "@/common/config";
import { useEffect } from "react";

export type RouteLoader = () => Promise<unknown>;

/**
 * Warm every route chunk once the browser goes idle, so a lazily-loaded page is
 * already in the module cache by the time it is navigated to. */
export function useRoutePrefetch(loaders: readonly RouteLoader[]): void {
  useEffect(() => {
    const prefetch = () => {
      for (const load of loaders) {
        void load();
      }
    };

    const idle = window.requestIdleCallback as
      | typeof window.requestIdleCallback
      | undefined;

    if (!idle) {
      const timer = window.setTimeout(prefetch, ROUTE_PREFETCH_TIMEOUT_MS);
      return () => window.clearTimeout(timer);
    }

    const handle = idle(prefetch, { timeout: ROUTE_PREFETCH_TIMEOUT_MS });
    return () => window.cancelIdleCallback(handle);
  }, [loaders]);
}
