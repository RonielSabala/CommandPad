import { ScrollIntoView } from "@/common/constants/dom";
import type { RefObject } from "react";
import { useCallback, useLayoutEffect, useRef } from "react";

/** Keeps `ref` in view across a change of `state`. */
export function useKeepInView(
  ref: RefObject<HTMLElement | null> | undefined,
  state: unknown,
): () => void {
  const armedRef = useRef(false);

  useLayoutEffect(() => {
    if (!armedRef.current) {
      return;
    }

    armedRef.current = false;
    ref?.current?.scrollIntoView({ block: ScrollIntoView.BLOCK_NEAREST });
  }, [state, ref]);

  return useCallback(() => {
    armedRef.current = true;
  }, []);
}
