import { useStore } from "@/store/store";
import { useLayoutEffect } from "react";

import { applyTabSize } from "./tabSize";

/** Keep every code surface's tab width in step with the setting. */
export function useMonacoTabSize(): void {
  const tabWidth = useStore((state) => state.tabWidth);

  useLayoutEffect(() => applyTabSize(tabWidth), [tabWidth]);
}
