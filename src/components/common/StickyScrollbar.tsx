import { StickyScrollbarConfig } from "@/common/config";
import { EventType, PASSIVE } from "@/common/constants/events";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ScrollTarget } from "./scrollTarget";
import "./StickyScrollbar.css";

interface Props {
  target: ScrollTarget | null;
  deps: unknown[];
}

function samePosition(a: number, b: number | null): boolean {
  return b !== null && Math.abs(a - b) < StickyScrollbarConfig.EPSILON_PX;
}

export function StickyScrollbar({ target, deps }: Props) {
  const proxyRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);

  const overflowing = scrollRange > 0;

  useLayoutEffect(() => {
    if (!target) {
      return;
    }

    const measure = () => {
      const clientWidth = target.getClientWidth();
      if (clientWidth <= 0) {
        return;
      }

      setScrollRange(Math.max(0, target.getScrollWidth() - clientWidth));
    };

    measure();
    return target.onResize(measure);
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

    proxy.scrollLeft = target.getScrollLeft();

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
    <div className="sticky-scrollbar" ref={proxyRef} aria-hidden="true">
      <div
        className="sticky-scrollbar-track"
        style={{ width: `calc(100% + ${scrollRange}px)` }}
      />
    </div>
  );
}
