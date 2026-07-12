import { DocsScrollSpy } from "@/common/config";
import { useEffect, useState, type RefObject } from "react";

// Tracks which docs section currently occupies the top quarter of the
// scroll container. Sections span the band while being read, so the first
// intersecting id (in document order) is the active one; when the viewport
// sits in a gap between sections, fall back to the last section above it.
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

    const intersecting = new Set<string>();
    const above = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;

          if (entry.isIntersecting) {
            intersecting.add(id);
            above.delete(id);
          } else {
            intersecting.delete(id);

            const rootTop = entry.rootBounds?.top ?? 0;
            if (entry.boundingClientRect.top < rootTop) {
              above.add(id);
            } else {
              above.delete(id);
            }
          }
        }

        const firstVisible = ids.find((id) => intersecting.has(id));
        if (firstVisible) {
          setActiveId(firstVisible);
          return;
        }

        for (let i = ids.length - 1; i >= 0; i--) {
          if (above.has(ids[i])) {
            setActiveId(ids[i]);
            return;
          }
        }

        setActiveId(ids[0] ?? null);
      },
      {
        root,
        rootMargin: DocsScrollSpy.ROOT_MARGIN,
        threshold: DocsScrollSpy.THRESHOLD,
      },
    );

    for (const id of ids) {
      const element = root.querySelector(`#${CSS.escape(id)}`);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [ids, rootRef]);

  return activeId;
}
