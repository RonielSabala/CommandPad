import { DocsScrollSpy } from "@/common/config";
import { EventType } from "@/common/constants/events";
import { useEffect, useState, type RefObject } from "react";

export function useScrollSpy(
  ids: readonly string[],
  rootRef: RefObject<HTMLElement | null>,
): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const elements = ids
      .map((id) => root.querySelector(`#${CSS.escape(id)}`))
      .filter((element): element is Element => element !== null);

    const resolveActive = () => {
      let current = ids[0] ?? null;

      if (root.scrollTop > 0) {
        const line =
          root.getBoundingClientRect().top +
          root.clientHeight * DocsScrollSpy.TRIGGER_RATIO;

        for (const element of elements) {
          if (element.getBoundingClientRect().top >= line) {
            break;
          }

          current = element.id;
        }
      }

      setActiveId(current);
    };

    let frame = 0;
    const schedule = () => {
      if (frame) {
        return;
      }

      frame = requestAnimationFrame(() => {
        frame = 0;
        resolveActive();
      });
    };

    resolveActive();
    root.addEventListener(EventType.SCROLL, schedule, { passive: true });

    const observer = new ResizeObserver(schedule);
    observer.observe(root);

    for (const element of elements) {
      observer.observe(element);
    }

    return () => {
      root.removeEventListener(EventType.SCROLL, schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ids, rootRef]);

  return activeId;
}
