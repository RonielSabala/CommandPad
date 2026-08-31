import { TooltipConfig } from "@/common/config";
import { TooltipSide } from "@/common/enums";

export interface TooltipPlacement {
  x: number;
  y: number;
  side: TooltipSide;
  arrowX: number;
}

export function placeTooltip(
  anchor: DOMRect,
  size: { width: number; height: number },
  viewport: { width: number; height: number },
): TooltipPlacement {
  const { GAP, VIEWPORT_MARGIN, ARROW_INSET } = TooltipConfig;

  const below = anchor.bottom + GAP;
  const fitsBelow = below + size.height <= viewport.height - VIEWPORT_MARGIN;
  const side = fitsBelow ? TooltipSide.BOTTOM : TooltipSide.TOP;
  const y = fitsBelow ? below : anchor.top - GAP - size.height;

  const centered = anchor.left + anchor.width / 2 - size.width / 2;
  const maxX = viewport.width - VIEWPORT_MARGIN - size.width;
  const x = Math.max(VIEWPORT_MARGIN, Math.min(centered, maxX));

  const arrowX = Math.max(
    ARROW_INSET,
    Math.min(anchor.left + anchor.width / 2 - x, size.width - ARROW_INSET),
  );

  return {
    x: Math.round(x),
    y: Math.round(Math.max(VIEWPORT_MARGIN, y)),
    side,
    arrowX: Math.round(arrowX),
  };
}
