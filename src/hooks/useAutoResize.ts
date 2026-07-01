import { useLayoutEffect, type RefObject } from 'react';

/**
 * Grow/shrink a textarea to fit its content whenever one of `deps` changes.
 * Used for command textareas (note blocks size themselves via a CSS grid trick).
 */
export function useAutoResize(ref: RefObject<HTMLTextAreaElement | null>, deps: unknown[]): void {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
