import { TooltipConfig } from "@/common/config";
import { DataAttr } from "@/common/constants/dom";
import { EventType } from "@/common/constants/events";
import type { TooltipVariant } from "@/common/enums";
import { classNames } from "@/utils/string";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

import "./Tooltip.css";
import { tooltipTarget } from "./tooltip";
import { placeTooltip, type TooltipPlacement } from "./tooltipPlacement";

interface ActiveTooltip {
  element: HTMLElement;
  text: string;
  variant: TooltipVariant | null;
}

const FOCUS_VISIBLE = ":focus-visible";

const PASSIVE = { passive: true } as const;
const PASSIVE_CAPTURE = { passive: true, capture: true } as const;

/** The app's one tooltip. */
export function TooltipLayer() {
  const [active, setActive] = useState<ActiveTooltip | null>(null);
  const [placement, setPlacement] = useState<TooltipPlacement | null>(null);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<ActiveTooltip | null>(null);
  const lastActiveRef = useRef<ActiveTooltip | null>(null);
  const lastPlacementRef = useRef<TooltipPlacement | null>(null);
  const timerRef = useRef<number | null>(null);
  const warmUntilRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    if (timerRef.current === null && activeRef.current === null) {
      return;
    }

    clearTimer();

    if (activeRef.current) {
      warmUntilRef.current = Date.now() + TooltipConfig.WARM_WINDOW_MS;
      activeRef.current = null;
      setActive(null);
    }
  }, [clearTimer]);

  const show = useCallback(
    (element: HTMLElement) => {
      if (activeRef.current?.element === element) {
        return;
      }

      clearTimer();

      const text = element.getAttribute(DataAttr.TOOLTIP);
      if (!text) {
        hide();
        return;
      }

      if (activeRef.current) {
        hide();
      }

      const delay =
        Date.now() < warmUntilRef.current
          ? TooltipConfig.WARM_DELAY_MS
          : TooltipConfig.SHOW_DELAY_MS;

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        const next: ActiveTooltip = {
          element,
          text,
          variant: element.getAttribute(
            DataAttr.TOOLTIP_VARIANT,
          ) as TooltipVariant | null,
        };

        activeRef.current = next;
        lastActiveRef.current = next;
        setActive(next);
      }, delay);
    },
    [clearTimer, hide],
  );

  useEffect(() => {
    const onPointerOver = (event: PointerEvent) => {
      const element = tooltipTarget(event.target);

      if (element) {
        show(element);
        return;
      }

      if (activeRef.current) {
        hide();
      } else {
        clearTimer();
      }
    };

    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        hide();
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      const element = tooltipTarget(event.target);
      if (element?.matches(FOCUS_VISIBLE)) {
        show(element);
      }
    };

    document.addEventListener(EventType.POINTER_OVER, onPointerOver, PASSIVE);
    document.addEventListener(EventType.POINTER_OUT, onPointerOut, PASSIVE);
    document.addEventListener(EventType.FOCUS_IN, onFocusIn, PASSIVE);
    document.addEventListener(EventType.FOCUS_OUT, hide, PASSIVE);
    document.addEventListener(EventType.POINTER_DOWN, hide, PASSIVE);
    document.addEventListener(EventType.KEY_DOWN, hide, PASSIVE);
    document.addEventListener(EventType.SCROLL, hide, PASSIVE_CAPTURE);
    window.addEventListener(EventType.RESIZE, hide, PASSIVE);
    window.addEventListener(EventType.BLUR, hide, PASSIVE);

    return () => {
      document.removeEventListener(EventType.POINTER_OVER, onPointerOver);
      document.removeEventListener(EventType.POINTER_OUT, onPointerOut);
      document.removeEventListener(EventType.FOCUS_IN, onFocusIn);
      document.removeEventListener(EventType.FOCUS_OUT, hide);
      document.removeEventListener(EventType.POINTER_DOWN, hide);
      document.removeEventListener(EventType.KEY_DOWN, hide);
      document.removeEventListener(EventType.SCROLL, hide, PASSIVE_CAPTURE);
      window.removeEventListener(EventType.RESIZE, hide);
      window.removeEventListener(EventType.BLUR, hide);
    };
  }, [clearTimer, hide, show]);

  // Measure the rendered bubble, then place it
  useLayoutEffect(() => {
    const bubble = tooltipRef.current;
    if (!active || !bubble) {
      setPlacement(null);
      return;
    }

    if (!active.element.isConnected) {
      hide();
      return;
    }

    const next = placeTooltip(
      active.element.getBoundingClientRect(),
      bubble.getBoundingClientRect(),
      { width: window.innerWidth, height: window.innerHeight },
    );

    lastPlacementRef.current = next;
    setPlacement(next);
  }, [active, hide]);

  useEffect(() => clearTimer, [clearTimer]);

  const shown = active ?? lastActiveRef.current;
  const shownPlacement = placement ?? lastPlacementRef.current;
  const visible = Boolean(active && placement);

  if (!shown) {
    return null;
  }

  return createPortal(
    <div
      ref={tooltipRef}
      className={classNames(
        "tooltip",
        visible && "is-visible",
        !shownPlacement && "is-unplaced",
        shown?.variant && `tooltip-${shown.variant}`,
      )}
      role="tooltip"
      aria-hidden
      {...{ [DataAttr.TOOLTIP_SIDE]: shownPlacement?.side }}
      style={
        {
          left: shownPlacement?.x ?? 0,
          top: shownPlacement?.y ?? 0,
          "--tooltip-gap": `${TooltipConfig.GAP}px`,
          "--tooltip-arrow-x": `${shownPlacement?.arrowX ?? 0}px`,
        } as CSSProperties
      }
    >
      {shown?.text}
      <span className="tooltip-arrow" />
    </div>,
    document.body,
  );
}
