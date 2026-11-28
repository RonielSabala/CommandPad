import { StickyScrollbarConfig } from "@/common/config";
import { EventType, PASSIVE } from "@/common/constants/events";
import { toPx } from "@/utils/dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { ScrollTarget } from "./scrollTarget";
import "./StickyScrollbar.css";

interface Props {
  target: ScrollTarget | null;
  deps: unknown[];
}

function samePosition(a: number, b: number | null): boolean {
  return b !== null && Math.abs(a - b) < StickyScrollbarConfig.EPSILON_PX;
}

type Measure = () => void;

/**
 * Queues measures into one batch run by `schedule`: all reads first, then
 * one render committed at once, so what it measured shows before the next
 * paint.
 */
function measureBatch(
  schedule: (flush: () => void) => void,
): (measure: Measure) => () => void {
  const pending = new Set<Measure>();
  let queued = false;

  const flush = () => {
    queued = false;
    const measures = [...pending];
    pending.clear();

    flushSync(() => measures.forEach((run) => run()));
  };

  return (measure) => {
    pending.add(measure);

    if (!queued) {
      queued = true;
      schedule(flush);
    }

    return () => pending.delete(measure);
  };
}

// A surface that just showed measures right after the task that showed it
const measureNow = measureBatch(queueMicrotask);

// A change measures in the next frame callback, after that frame's writes
const measureInFrame = measureBatch(requestAnimationFrame);

export function StickyScrollbar({ target, deps }: Props) {
  const proxyRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<Measure | null>(null);
  const justSubscribed = useRef(false);

  const [scrollRange, setScrollRange] = useState(0);

  // A range measured on a surface that has gone no longer applies
  const overflowing = target !== null && scrollRange > 0;

  // Once per surface, before paint: it shows with its scrollbar in its first frame
  useLayoutEffect(() => {
    if (!target) {
      return;
    }

    const measure = () => {
      const clientWidth = target.getClientWidth();
      if (clientWidth > 0) {
        setScrollRange(Math.max(0, target.getScrollWidth() - clientWidth));
      }
    };

    measureRef.current = measure;
    justSubscribed.current = true;

    const cancel = measureNow(measure);
    let cancelResize: (() => void) | undefined;
    const unsubscribe = target.onResize(() => {
      cancelResize = measureInFrame(measure);
    });

    return () => {
      measureRef.current = null;
      unsubscribe();
      cancel();
      cancelResize?.();
    };
  }, [target]);

  // A surface just subscribed has been measured already
  useLayoutEffect(() => {
    const measure = measureRef.current;
    const fresh = justSubscribed.current;
    justSubscribed.current = false;

    return measure && !fresh ? measureInFrame(measure) : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, ...deps]);

  useEffect(() => {
    const proxy = proxyRef.current;

    if (!target || !proxy) {
      return;
    }

    // The position last written to each side
    let writtenToProxy: number | null = null;
    let writtenToTarget: number | null = null;

    const onTargetScroll = () => {
      const left = target.getScrollLeft();
      const echo = samePosition(left, writtenToTarget);
      writtenToTarget = null;

      if (echo || samePosition(proxy.scrollLeft, left)) {
        return;
      }

      writtenToProxy = left;
      proxy.scrollLeft = left;
    };

    const onProxyScroll = () => {
      const left = proxy.scrollLeft;
      const echo = samePosition(left, writtenToProxy);
      writtenToProxy = null;

      if (echo || samePosition(target.getScrollLeft(), left)) {
        return;
      }

      writtenToTarget = left;
      target.setScrollLeft(left);
    };

    const left = target.getScrollLeft();
    if (left !== 0) {
      proxy.scrollLeft = left;
    }

    const unsubscribe = target.onScroll(onTargetScroll);
    proxy.addEventListener(EventType.SCROLL, onProxyScroll, PASSIVE);

    return () => {
      unsubscribe();
      proxy.removeEventListener(EventType.SCROLL, onProxyScroll);
    };
  }, [target, overflowing]);

  if (!overflowing) {
    return null;
  }

  return (
    <div className="sticky-scrollbar" ref={proxyRef} aria-hidden={true}>
      <div
        className="sticky-scrollbar-track"
        style={{ width: `calc(100% + ${toPx(scrollRange)})` }}
      />
    </div>
  );
}
