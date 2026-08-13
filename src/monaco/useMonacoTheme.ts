import { useStore } from "@/store/store";
import { useEffect } from "react";
import { applyMonacoTheme } from "./theme";

/** Keep the editor theme in step with the app's. */
export function useMonacoTheme(): void {
  const theme = useStore((state) => state.theme);

  useEffect(() => applyMonacoTheme(theme), [theme]);
}
