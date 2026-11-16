import { getAppliedTheme, useStore } from "@/store/store";
import { useEffect } from "react";
import { applyMonacoTheme } from "./theme";

/** Keep the editor theme in step with the app's. */
export function useMonacoTheme(): void {
  const theme = useStore(getAppliedTheme);

  useEffect(() => applyMonacoTheme(theme), [theme]);
}
