import { MinimapConfig } from "@/common/config";
import { EventType, MouseButton, PASSIVE } from "@/common/constants/events";
import { CodeRendering } from "@/common/enums";
import { CodeRenderingProvider } from "@/components/common/codeEditor/codeRendering";
import { classNames } from "@/utils/string";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

import "./Minimap.css";

interface MinimapMetrics {
  scrollHeight: number;
  clientHeight: number;
  hostHeight: number;
  listWidth: number;
}

const INITIAL_METRICS: MinimapMetrics = {
  scrollHeight: 0,
  clientHeight: 0,
  hostHeight: 0,
  listWidth: 0,
};

function sameMetrics(a: MinimapMetrics, b: MinimapMetrics): boolean {
  return (
    a.scrollHeight === b.scrollHeight &&
    a.clientHeight === b.clientHeight &&
    a.hostHeight === b.hostHeight &&
    a.listWidth === b.listWidth
  );
}

/** The frame every miniature renders into. */
export function MinimapMirror({
  className,
  width,
  children,
}: {
  className?: string;
  width: number;
  children: ReactNode;
}) {
  return (
    <CodeRenderingProvider value={CodeRendering.STATIC}>
      <div
        className={classNames("minimap-mirror", className)}
        inert
        style={{ width }}
      >
        {children}
      </div>
    </CodeRenderingProvider>
  );
}

interface Props {
  scrollRef: RefObject<HTMLDivElement | null>;
  listId: string;
  mirror: ComponentType<{ width: number }>;
}

export function Minimap({ scrollRef, listId, mirror: Mirror }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const overscrollRef = useRef(0);

  const [metrics, setMetrics] = useState<MinimapMetrics>(INITIAL_METRICS);
  const metricsRef = useRef(metrics);

  const place = useCallback(() => {
    const container = scrollRef.current;
    const content = contentRef.current;
    const viewport = viewportRef.current;

    if (!container || !content || !viewport) {
      return;
    }

    const scale = MinimapConfig.SCALE;
    const { scrollHeight, clientHeight, hostHeight } = metricsRef.current;

    const maxScroll = Math.max(0, scrollHeight - clientHeight);
    const overflow = Math.max(0, scrollHeight * scale - hostHeight);
    const offset =
      maxScroll > 0 ? (container.scrollTop / maxScroll) * overflow : 0;

    content.style.transform = `translateY(${-offset}px) scale(${scale})`;
    viewport.style.height = `${clientHeight * scale}px`;
    viewport.style.transform = `translateY(${container.scrollTop * scale - offset}px)`;
  }, [scrollRef]);

  const measure = useCallback(() => {
    const container = scrollRef.current;
    const host = hostRef.current;
    const list = container?.querySelector<HTMLElement>(`#${listId}`);

    if (!container || !host || !list) {
      return;
    }

    // Reserve scroll space below the content so the last row can reach the top of the view
    const lastRow = list.lastElementChild as HTMLElement | null;
    const previousReserve = overscrollRef.current;
    const baseHeight = container.scrollHeight - previousReserve;
    let reserve = 0;

    if (lastRow) {
      const lastTop =
        lastRow.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;

      reserve = Math.max(
        0,
        Math.round(container.clientHeight - (baseHeight - lastTop)),
      );
    }

    if (reserve !== previousReserve) {
      overscrollRef.current = reserve;
      container.style.setProperty(
        MinimapConfig.OVERSCROLL_PROPERTY,
        `${reserve}px`,
      );
    }

    const next: MinimapMetrics = {
      scrollHeight: container.scrollHeight,
      clientHeight: container.clientHeight,
      hostHeight: host.clientHeight,
      listWidth: list.clientWidth,
    };

    if (!sameMetrics(metricsRef.current, next)) {
      metricsRef.current = next;
      setMetrics(next);
    }

    place();
  }, [scrollRef, listId, place]);

  // Drop the reserved scroll space when the minimap is turned off
  useLayoutEffect(() => {
    const container = scrollRef.current;
    return () => {
      container?.style.removeProperty(MinimapConfig.OVERSCROLL_PROPERTY);
    };
  }, [scrollRef]);

  // Observer for all geometry sources
  useLayoutEffect(() => {
    measure();

    const container = scrollRef.current;
    const host = hostRef.current;
    const list = container?.querySelector<HTMLElement>(`#${listId}`);

    if (!container || !host || !list) {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(host);
    observer.observe(list);

    return () => observer.disconnect();
  }, [measure, scrollRef, listId]);

  // Scroll
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    container.addEventListener(EventType.SCROLL, place, PASSIVE);
    return () => container.removeEventListener(EventType.SCROLL, place);
  }, [scrollRef, place]);

  // Scroll wheel
  useLayoutEffect(() => {
    const host = hostRef.current;
    const container = scrollRef.current;

    if (!host || !container) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      container.scrollTop += event.deltaY;
    };

    host.addEventListener(EventType.WHEEL, onWheel, { passive: true });
    return () => host.removeEventListener(EventType.WHEEL, onWheel);
  }, [scrollRef]);

  // When the miniature overflows the track, the full track maps linearly onto the full scroll range
  const scrollFromPointer = (clientY: number) => {
    const container = scrollRef.current;
    const host = hostRef.current;

    if (!container || !host) {
      return;
    }

    const scale = MinimapConfig.SCALE;
    const y = clientY - host.getBoundingClientRect().top;
    const contentHeight = container.scrollHeight * scale;

    if (contentHeight <= host.clientHeight) {
      container.scrollTop = y / scale - container.clientHeight / 2;
      return;
    }

    const sliderHeight = container.clientHeight * scale;
    const track = host.clientHeight - sliderHeight;
    const maxScroll = container.scrollHeight - container.clientHeight;

    container.scrollTop =
      track > 0 ? ((y - sliderHeight / 2) / track) * maxScroll : 0;
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== MouseButton.LEFT) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    scrollFromPointer(event.clientY);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      scrollFromPointer(event.clientY);
    }
  };

  return (
    <div
      className="minimap"
      ref={hostRef}
      aria-hidden="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      <div className="minimap-content" ref={contentRef}>
        <Mirror width={metrics.listWidth} />
      </div>
      <div className="minimap-viewport" ref={viewportRef} />
    </div>
  );
}
