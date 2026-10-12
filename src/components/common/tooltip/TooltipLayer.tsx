import { TooltipConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { BodySelector, DataAttr, PopupSelector } from "@/common/constants/dom";
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
import { createPortal, flushSync } from "react-dom";

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

interface PointerPosition {
  x: number;
  y: number;
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
  const [pinned, setPinned] = useState(false);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<ActiveTooltip | null>(null);
  const lastActiveRef = useRef<ActiveTooltip | null>(null);
  const lastPlacementRef = useRef<TooltipPlacement | null>(null);
  const timerRef = useRef<number | null>(null);
  const handingOffRef = useRef(false);
  const pinnedRef = useRef(false);
  const warmUntilRef = useRef(0);
  const lastPointerDownRef = useRef<PointerPosition | null>(null);
  const dismissedAtRef = useRef<PointerPosition | null>(null);

  const clearTimer = useCallback(() => {
    handingOffRef.current = false;
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

  const ownsTarget = useCallback(
    (target: EventTarget | null) =>
      insideBubble(target) ||
      (pinnedRef.current &&
        target instanceof Element &&
        !!target.closest(PopupSelector.LAYERS)),
    [insideBubble],
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
    pinnedRef.current = false;
    setActive(null);

    const focused = document.activeElement;
    if (focused instanceof HTMLElement && insideBubble(focused)) {
      focused.blur();
    }
  }, [clearTimer, insideBubble]);

  const activate = useCallback((element: HTMLElement) => {
    const next: ActiveTooltip = {
      element,
      text: element.getAttribute(DataAttr.TOOLTIP) ?? "",
      variant: element.getAttribute(
        DataAttr.TOOLTIP_VARIANT,
      ) as TooltipVariant | null,
      richId: element.getAttribute(DataAttr.TOOLTIP_RICH),
    };

    activeRef.current = next;
    lastActiveRef.current = next;
    pinnedRef.current = false;

    setActive(next);
    setPinned(false);
  }, []);

  /** The content is being edited. */
  const pin = useCallback(() => {
    if (!activeRef.current) {
      return;
    }

    clearTimer();
    pinnedRef.current = true;
    setPinned(true);
  }, [clearTimer]);

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
        activate(element);
      }, delay);
    },
    [activate, clearTimer, hide],
  );

  /** The pointer left, maybe for `next`. */
  const leave = useCallback(
    (next: HTMLElement | null = null) => {
      if (!activeRef.current?.richId) {
        hide();
        return;
      }

      // Resting on another trigger swaps straight to it
      if (next) {
        clearTimer();
        handingOffRef.current = true;

        timerRef.current = window.setTimeout(() => {
          timerRef.current = null;
          handingOffRef.current = false;

          if (next.isConnected) {
            lastPlacementRef.current = null;
            activate(next);
          } else {
            hide();
          }
        }, TooltipConfig.HANDOFF_DELAY_MS);

        return;
      }

      // Off the trigger again before the swap, so back to hiding
      if (handingOffRef.current) {
        clearTimer();
      }
      if (timerRef.current !== null) {
        return;
      }

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        hide();
      }, TooltipConfig.HIDE_DELAY_MS);
    },
    [activate, clearTimer, hide],
  );

  /** The content closed it. */
  const dismiss = useCallback(() => {
    hide();
    warmUntilRef.current = 0;
    dismissedAtRef.current = lastPointerDownRef.current;
  }, [hide]);

  useEffect(() => {
    const onPointerOver = (event: PointerEvent) => {
      if (pinnedRef.current) {
        return;
      }

      if (insideBubble(event.target)) {
        clearTimer();
        return;
      }

      // The page under a dismissed bubble
      const dismissedAt = dismissedAtRef.current;
      if (dismissedAt) {
        if (
          event.clientX === dismissedAt.x &&
          event.clientY === dismissedAt.y
        ) {
          return;
        }
        dismissedAtRef.current = null;
      }

      const element = tooltipTarget(event.target);
      const rich = activeRef.current?.richId;

      if (element && !(rich && activeRef.current?.element !== element)) {
        show(element);
        return;
      }

      leave(element);
    };

    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget && !pinnedRef.current) {
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
      const next = event.relatedTarget;
      if (!ownsTarget(next) && !(pinnedRef.current && !next)) {
        hide();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      lastPointerDownRef.current = { x: event.clientX, y: event.clientY };
      if (!ownsTarget(event.target)) {
        hide();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !ownsTarget(event.target) ||
        (event.key === Key.ESCAPE &&
          (pinnedRef.current || !event.defaultPrevented))
      ) {
        hide();
      }
    };

    const onScroll = (event: Event) => {
      if (!ownsTarget(event.target)) {
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
  }, [clearTimer, hide, insideBubble, leave, ownsTarget, show]);

  const shown = active ?? lastActiveRef.current;
  const shownRichId = shown?.richId ?? null;
  const shownAnchor = shown?.element ?? null;
  const shownPlacement = placement ?? lastPlacementRef.current;
  const visible = Boolean(active && placement);

  // Hand the content element to the rich anchor
  useLayoutEffect(() => {
    const element = contentRef.current;
    publishRichTooltipSlot(
      shownRichId && element && shownAnchor
        ? {
            id: shownRichId,
            element,
            anchor: shownAnchor,
            hide: dismiss,
            pinned,
            pin,
          }
        : null,
    );
  }, [shownRichId, shownAnchor, dismiss, pinned, pin]);

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
      if (!active.element.isConnected) {
        return;
      }

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

      const observer = new ResizeObserver(() => flushSync(place));
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
        pinned && "is-pinned",
        visible && "is-visible",
        shownRichId && "is-interactive",
        !shownPlacement && "is-unplaced",
        shown.variant && `tooltip-${shown.variant}`,
      )}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && !activeRef.current) {
          setPinned(false);
        }
      }}
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
