import { useMonacoBootstrap } from "./useMonacoBootstrap";
import { useMonacoTheme } from "./useMonacoTheme";

/** Bring Monaco up for a route that renders code surfaces. */
export function useMonacoRuntime(): void {
  useMonacoBootstrap();
  useMonacoTheme();
}
