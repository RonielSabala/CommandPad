import { EventType } from "@/common/constants/events";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ScrollTarget } from "./scrollTarget";
import "./StickyScrollbar.css";

interface Props {
  target: ScrollTarget | null;
  deps: unknown[];
}

export function StickyScrollbar({ target, deps }: Props) {
  const proxyRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    if (!target) {
      return;
    }

    const measure = () => {
      const clientWidth = target.getClientWidth();
      if (clientWidth <= 0) {
        return;
      }

      const scrollWidth = target.getScrollWidth();
      setContentWidth(scrollWidth);
      setOverflowing(scrollWidth > clientWidth);
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

    proxy.scrollLeft = target.getScrollLeft();

    const onTargetScroll = () => {
      const left = target.getScrollLeft();
      if (proxy.scrollLeft !== left) {
        proxy.scrollLeft = left;
      }
    };
    const onProxyScroll = () => {
      if (target.getScrollLeft() !== proxy.scrollLeft) {
        target.setScrollLeft(proxy.scrollLeft);
      }
    };

    const unsubscribe = target.onScroll(onTargetScroll);
    proxy.addEventListener(EventType.SCROLL, onProxyScroll, { passive: true });

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
      <div className="sticky-scrollbar-track" style={{ width: contentWidth }} />
    </div>
  );
}
