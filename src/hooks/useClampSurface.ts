import { ScrollIntoView } from "@/common/constants/dom";
import { ClampConfig } from "@/common/editorConfig";
import type { ClampSurface } from "@/common/enums";
import { useStore } from "@/store/store";
import type { CSSProperties, RefObject } from "react";
import { useCallback, useLayoutEffect, useRef } from "react";

export const CLAMP_SURFACE_STYLE = {
  [ClampConfig.MAX_LINES_PROPERTY]: ClampConfig.MAX_LINES,
} as CSSProperties;

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
  const overflows = lines > ClampConfig.MAX_LINES;

  const expanded = useStore((state) =>
    state.expandedClampSurfaces[surface].has(id),
  );
  const toggleExpanded = useStore((state) => state.toggleClampSurfaceExpanded);
  const autoExpandedRef = useRef(false);
  const keepInViewRef = useRef(false);

  const toggle = useCallback(() => {
    keepInViewRef.current = true;
    toggleExpanded(id, surface);
  }, [toggleExpanded, id, surface]);

  useLayoutEffect(() => {
    if (!keepInViewRef.current) {
      return;
    }

    keepInViewRef.current = false;
    surfaceRef?.current?.scrollIntoView({
      block: ScrollIntoView.BLOCK_NEAREST,
    });
  }, [expanded, surfaceRef]);

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
