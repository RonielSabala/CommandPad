import { ClampConfig } from "@/common/editorConfig";
import type { ClampSurface } from "@/common/enums";
import { useStore, useStoreActions } from "@/store/store";
import type { CSSProperties, RefObject } from "react";
import { useCallback, useMemo, useRef } from "react";

import { useKeepInView } from "./useKeepInView";

/** The style a clamp surface's root wears. */
export function useClampSurfaceStyle(): CSSProperties {
  const maxLines = useStore((state) => state.clampMaxLines);

  return useMemo(
    () => ({ [ClampConfig.MAX_LINES_PROPERTY]: maxLines }) as CSSProperties,
    [maxLines],
  );
}

export interface ClampState {
  overflows: boolean;
  expanded: boolean;
  clamped: boolean;
  toggle: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

export function useClampSurface(
  id: string,
  surface: ClampSurface,
  lines: number,
  surfaceRef?: RefObject<HTMLElement | null>,
): ClampState {
  const maxLines = useStore((state) => state.clampMaxLines);
  const overflows = lines > maxLines;

  const expanded = useStore((state) =>
    state.expandedClampSurfaces[surface].has(id),
  );
  const { toggleClampSurfaceExpanded: toggleExpanded } = useStoreActions();
  const autoExpandedRef = useRef(false);
  const keepInView = useKeepInView(surfaceRef, expanded);

  const toggle = useCallback(() => {
    keepInView();
    toggleExpanded(id, surface);
  }, [keepInView, toggleExpanded, id, surface]);

  const onFocus = useCallback(() => {
    if (overflows && !expanded) {
      autoExpandedRef.current = true;
      toggleExpanded(id, surface);
    }
  }, [overflows, expanded, toggleExpanded, id, surface]);

  const onBlur = useCallback(() => {
    if (autoExpandedRef.current) {
      autoExpandedRef.current = false;
      toggleExpanded(id, surface);
    }
  }, [toggleExpanded, id, surface]);

  return {
    overflows,
    expanded,
    clamped: overflows && !expanded,
    toggle,
    onFocus,
    onBlur,
  };
}
