import { TooltipConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { BodySelector, DataAttr } from "@/common/constants/dom";
import {
  EventType,
  Key,
  PASSIVE,
  PASSIVE_CAPTURE,
} from "@/common/constants/events";
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
import { publishRichTooltipSlot } from "./richTooltip";
import { tooltipTarget } from "./tooltip";
import { placeTooltip, type TooltipPlacement } from "./tooltipPlacement";

interface ActiveTooltip {
  element: HTMLElement;
  text: string;
  variant: TooltipVariant | null;
  /** Set when the anchor renders its own content. */
  richId: string | null;
}

const FOCUS_VISIBLE = ":focus-visible";

/** The width of the widest line box the text wrapped into. */
function longestLineWidth(text: HTMLElement): number {
  const range = document.createRange();
  range.selectNodeContents(text);

  let widest = 0;
  for (const line of range.getClientRects()) {
    widest = Math.max(widest, line.width);
  }

  return Math.ceil(widest);
}

/** The app's one tooltip. */
export function TooltipLayer() {
  const [active, setActive] = useState<ActiveTooltip | null>(null);
  const [placement, setPlacement] = useState<TooltipPlacement | null>(null);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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

  const insideBubble = useCallback(
    (target: EventTarget | null) =>
      target instanceof Node && !!tooltipRef.current?.contains(target),
    [],
  );

  const hide = useCallback(() => {
    if (timerRef.current === null && activeRef.current === null) {
      return;
    }

    clearTimer();

    if (!activeRef.current) {
      return;
    }

    warmUntilRef.current = Date.now() + TooltipConfig.WARM_WINDOW_MS;
    activeRef.current = null;
    setActive(null);

    const focused = document.activeElement;
    if (focused instanceof HTMLElement && insideBubble(focused)) {
      focused.blur();
    }
  }, [clearTimer, insideBubble]);

  /** The pointer left. */
  const leave = useCallback(() => {
    if (!activeRef.current?.richId) {
      hide();
      return;
    }

    if (timerRef.current !== null) {
      return;
    }

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      hide();
    }, TooltipConfig.HIDE_DELAY_MS);
  }, [hide]);

  const show = useCallback(
    (element: HTMLElement) => {
      if (document.body.matches(BodySelector.RESIZING)) {
        hide();
        return;
      }

      if (activeRef.current?.element === element) {
        clearTimer();
        return;
      }

      clearTimer();

      const text = element.getAttribute(DataAttr.TOOLTIP) ?? "";
      const richId = element.getAttribute(DataAttr.TOOLTIP_RICH);
      if (!text && !richId) {
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
          richId,
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
      if (insideBubble(event.target)) {
        clearTimer();
        return;
      }

      const element = tooltipTarget(event.target);

      if (element) {
        show(element);
        return;
      }

      leave();
    };

    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        leave();
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      if (insideBubble(event.target)) {
        clearTimer();
        return;
      }

      const element = tooltipTarget(event.target);
      if (element?.matches(FOCUS_VISIBLE)) {
        show(element);
      }
    };

    const onFocusOut = (event: FocusEvent) => {
      if (!insideBubble(event.relatedTarget)) {
        hide();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!insideBubble(event.target)) {
        hide();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !insideBubble(event.target) ||
        (event.key === Key.ESCAPE && !event.defaultPrevented)
      ) {
        hide();
      }
    };

    const onScroll = (event: Event) => {
      if (!insideBubble(event.target)) {
        hide();
      }
    };

    document.addEventListener(EventType.POINTER_OVER, onPointerOver, PASSIVE);
    document.addEventListener(EventType.POINTER_OUT, onPointerOut, PASSIVE);
    document.addEventListener(EventType.FOCUS_IN, onFocusIn, PASSIVE);
    document.addEventListener(EventType.FOCUS_OUT, onFocusOut, PASSIVE);
    document.addEventListener(EventType.POINTER_DOWN, onPointerDown, PASSIVE);
    document.addEventListener(EventType.KEY_DOWN, onKeyDown, PASSIVE);
    document.addEventListener(EventType.SCROLL, onScroll, PASSIVE_CAPTURE);
    window.addEventListener(EventType.RESIZE, hide, PASSIVE);
    window.addEventListener(EventType.BLUR, hide, PASSIVE);

    return () => {
      document.removeEventListener(EventType.POINTER_OVER, onPointerOver);
      document.removeEventListener(EventType.POINTER_OUT, onPointerOut);
      document.removeEventListener(EventType.FOCUS_IN, onFocusIn);
      document.removeEventListener(EventType.FOCUS_OUT, onFocusOut);
      document.removeEventListener(EventType.POINTER_DOWN, onPointerDown);
      document.removeEventListener(EventType.KEY_DOWN, onKeyDown);
      document.removeEventListener(EventType.SCROLL, onScroll, PASSIVE_CAPTURE);
      window.removeEventListener(EventType.RESIZE, hide);
      window.removeEventListener(EventType.BLUR, hide);
    };
  }, [clearTimer, hide, insideBubble, leave, show]);

  const shown = active ?? lastActiveRef.current;
  const shownRichId = shown?.richId ?? null;
  const shownPlacement = placement ?? lastPlacementRef.current;
  const visible = Boolean(active && placement);

  // Hand the content element to the rich anchor
  useLayoutEffect(() => {
    const element = contentRef.current;
    publishRichTooltipSlot(
      shownRichId && element ? { id: shownRichId, element } : null,
    );
  }, [shownRichId]);

  useEffect(() => () => publishRichTooltipSlot(null), []);

  // Shrink the rendered bubble to its content, then place it
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

    const place = () => {
      const next = placeTooltip(
        active.element.getBoundingClientRect(),
        bubble.getBoundingClientRect(),
        { width: window.innerWidth, height: window.innerHeight },
      );

      lastPlacementRef.current = next;
      setPlacement(next);
    };

    // Rich content renders after the bubble
    if (active.richId) {
      setPlacement(null);

      const observer = new ResizeObserver(place);
      observer.observe(bubble);

      return () => observer.disconnect();
    }

    const text = textRef.current;
    if (text) {
      text.style.width = "";
      const longest = longestLineWidth(text);

      if (longest > 0) {
        text.style.width = `${longest}px`;
      }
    }

    place();
  }, [active, hide]);

  useEffect(() => clearTimer, [clearTimer]);

  if (!shown) {
    return null;
  }

  return createPortal(
    <div
      ref={tooltipRef}
      className={classNames(
        CssClass.TOOLTIP,
        visible && "is-visible",
        shownRichId && "is-interactive",
        !shownPlacement && "is-unplaced",
        shown.variant && `tooltip-${shown.variant}`,
      )}
      role="tooltip"
      aria-hidden={!shownRichId}
      tabIndex={shownRichId ? -1 : undefined}
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
      {shownRichId ? (
        <div className="tooltip-content" ref={contentRef} />
      ) : (
        <span className="tooltip-label" ref={textRef}>
          {shown.text}
        </span>
      )}
      <span className="tooltip-arrow" />
    </div>,
    document.body,
  );
}
