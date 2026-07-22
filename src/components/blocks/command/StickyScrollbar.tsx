import { EventType } from "@/common/constants/events";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import "./StickyScrollbar.css";

interface Props {
  targetRef: RefObject<HTMLElement | null>;
  deps: unknown[];
}

export function StickyScrollbar({ targetRef, deps }: Props) {
  const proxyRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const target = targetRef.current;
    if (!target) {
      return;
    }

    const measure = () => {
      setContentWidth(target.scrollWidth);
      setOverflowing(target.scrollWidth > target.clientWidth);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(target);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef, ...deps]);

  useEffect(() => {
    const target = targetRef.current;
    const proxy = proxyRef.current;

    if (!target || !proxy) {
      return;
    }

    proxy.scrollLeft = target.scrollLeft;

    const mirror = (from: HTMLElement, to: HTMLElement) => () => {
      if (to.scrollLeft !== from.scrollLeft) {
        to.scrollLeft = from.scrollLeft;
      }
    };

    const onTargetScroll = mirror(target, proxy);
    const onProxyScroll = mirror(proxy, target);

    target.addEventListener(EventType.SCROLL, onTargetScroll, {
      passive: true,
    });
    proxy.addEventListener(EventType.SCROLL, onProxyScroll, { passive: true });

    return () => {
      target.removeEventListener(EventType.SCROLL, onTargetScroll);
      proxy.removeEventListener(EventType.SCROLL, onProxyScroll);
    };
  }, [targetRef, overflowing]);

  if (!overflowing) {
    return null;
  }

  return (
    <div className="sticky-scrollbar" ref={proxyRef} aria-hidden="true">
      <div className="sticky-scrollbar-track" style={{ width: contentWidth }} />
    </div>
  );
}
