import { LAZY_MOUNTS_PER_FRAME } from "@/common/editorConfig";
import { useCallback, useEffect, useState, type RefObject } from "react";

const pending = new Map<Element, () => void>();
let observer: IntersectionObserver | undefined;
let queued = false;

function mount(element: Element): void {
  const wake = pending.get(element);
  pending.delete(element);
  observer?.unobserve(element);

  wake?.();
  queueMount();
}

function getObserver(): IntersectionObserver {
  return (observer ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        mount(entry.target);
      }
    }
  }));
}

/** The shown pending elements, nearest the viewport first. */
function nearestPending(count: number): Element[] {
  const viewportHeight = window.innerHeight;
  const shown: [number, Element][] = [];

  for (const element of pending.keys()) {
    if (element.checkVisibility()) {
      const { top, bottom } = element.getBoundingClientRect();
      shown.push([Math.max(top - viewportHeight, -bottom, 0), element]);
    }
  }

  return shown
    .sort(([a], [b]) => a - b)
    .slice(0, count)
    .map(([, element]) => element);
}

function mountNearest(): void {
  queued = false;
  for (const element of nearestPending(LAZY_MOUNTS_PER_FRAME)) {
    mount(element);
  }
}

// A few elements per frame, right after it paints
function queueMount(): void {
  if (queued || pending.size === 0) {
    return;
  }

  queued = true;
  requestAnimationFrame(() => setTimeout(mountNearest));
}

/**
 * Whether the element is live: from the start when `initiallyLive`, else once
 * it first shows on screen, `wake` is called, or its turn comes.
 */
export function useLazyMount(
  ref: RefObject<HTMLElement | null>,
  initiallyLive: boolean,
): [live: boolean, wake: () => void] {
  const [live, setLive] = useState(initiallyLive);
  const wake = useCallback(() => setLive(true), []);

  useEffect(() => {
    const element = ref.current;
    if (live || !element) {
      return;
    }

    pending.set(element, wake);
    getObserver().observe(element);
    queueMount();

    return () => {
      pending.delete(element);
      observer?.unobserve(element);
    };
  }, [ref, live, wake]);

  return [live, wake];
}
