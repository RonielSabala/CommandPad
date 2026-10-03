import { ScrollIntoView } from "@/common/constants/dom";
import { findScrollParent, scrollParentBox } from "@/utils/scrollParent";
import type { RefObject } from "react";
import { useCallback, useLayoutEffect, useRef } from "react";

export type KeepInViewAlign =
  | typeof ScrollIntoView.BLOCK_NEAREST
  | typeof ScrollIntoView.BLOCK_START;

/** Keeps `ref` in view across a change of `state`. */
export function useKeepInView(
  ref: RefObject<HTMLElement | null> | undefined,
  state: unknown,
  align: KeepInViewAlign = ScrollIntoView.BLOCK_NEAREST,
): () => void {
  const armedRef = useRef(false);

  useLayoutEffect(() => {
    if (!armedRef.current) {
      return;
    }

    armedRef.current = false;
    const element = ref?.current;
    if (!element) {
      return;
    }

    if (align === ScrollIntoView.BLOCK_START) {
      const { top } = scrollParentBox(findScrollParent(element));
      if (element.getBoundingClientRect().top >= top) {
        return;
      }
    }

    element.scrollIntoView({ block: align });
  }, [state, ref, align]);

  return useCallback(() => {
    armedRef.current = true;
  }, []);
}
