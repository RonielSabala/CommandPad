import { MinimapConfig } from "@/common/config";
import { ElementId } from "@/common/constants/dom";
import { EventType, MouseButton } from "@/common/constants/events";
import type { Block, Variable } from "@/common/types";
import { getActiveTab, useStore } from "@/store/store";
import { getSecretKeys, getVariableMap } from "@/utils/resolution";
import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { BlockItem } from "./blocks/BlockItem";
import "./Minimap.css";

const EMPTY_BLOCKS: Block[] = [];
const EMPTY_VARIABLES: Variable[] = [];

const BLOCKS_LIST_SELECTOR = `#${ElementId.BLOCKS_LIST}`;

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

/** The real blocks, rendered a second time at miniature scale. */
const MinimapMirror = memo(function MinimapMirror({
  width,
}: {
  width: number;
}) {
  const activeTab = useStore(getActiveTab);
  const blocks = activeTab?.blocks ?? EMPTY_BLOCKS;
  const variables = activeTab?.variables ?? EMPTY_VARIABLES;

  const variableMap = useMemo(() => getVariableMap(variables), [variables]);
  const secretKeys = useMemo(() => getSecretKeys(variables), [variables]);

  return (
    <div className="minimap-mirror" inert style={{ width }}>
      {blocks.map((block) => (
        <BlockItem
          key={block.id}
          block={block}
          variableMap={variableMap}
          secretKeys={secretKeys}
        />
      ))}
    </div>
  );
});

interface Props {
  scrollRef: RefObject<HTMLDivElement | null>;
}

export function Minimap({ scrollRef }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const overscrollRef = useRef(0);
  const [metrics, setMetrics] = useState<MinimapMetrics>(INITIAL_METRICS);
  const [scrollTop, setScrollTop] = useState(0);

  const measure = useCallback(() => {
    const container = scrollRef.current;
    const host = hostRef.current;
    const list = container?.querySelector<HTMLElement>(BLOCKS_LIST_SELECTOR);

    if (!container || !host || !list) {
      return;
    }

    // Reserve scroll space below the content so the last block can reach the top of the view
    const lastBlock = list.lastElementChild as HTMLElement | null;
    const previousReserve = overscrollRef.current;
    const baseHeight = container.scrollHeight - previousReserve;
    let reserve = 0;

    if (lastBlock) {
      const lastTop =
        lastBlock.getBoundingClientRect().top -
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

    setMetrics((previous) => (sameMetrics(previous, next) ? previous : next));
    setScrollTop(container.scrollTop);
  }, [scrollRef]);

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
    const list = container?.querySelector<HTMLElement>(BLOCKS_LIST_SELECTOR);

    if (!container || !host || !list) {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(host);
    observer.observe(list);

    return () => observer.disconnect();
  }, [measure, scrollRef]);

  // Scroll
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const onScroll = () => setScrollTop(container.scrollTop);
    container.addEventListener(EventType.SCROLL, onScroll, { passive: true });
    return () => container.removeEventListener(EventType.SCROLL, onScroll);
  }, [scrollRef]);

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

  const scale = MinimapConfig.SCALE;
  const contentHeight = metrics.scrollHeight * scale;
  const maxScroll = Math.max(0, metrics.scrollHeight - metrics.clientHeight);
  const overflow = Math.max(0, contentHeight - metrics.hostHeight);
  const offset = maxScroll > 0 ? (scrollTop / maxScroll) * overflow : 0;

  return (
    <div
      className="minimap"
      ref={hostRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      <div
        className="minimap-content"
        style={{ transform: `translateY(${-offset}px) scale(${scale})` }}
      >
        <MinimapMirror width={metrics.listWidth} />
      </div>
      <div
        className="minimap-viewport"
        style={{
          top: scrollTop * scale - offset,
          height: metrics.clientHeight * scale,
        }}
      />
    </div>
  );
}
