import { useLayoutEffect, type RefObject } from "react";

export function useAutoResize(
  ref: RefObject<HTMLTextAreaElement | null>,
  deps: unknown[],
): void {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const resize = () => {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    };

    resize();
    const raf = requestAnimationFrame(resize);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
