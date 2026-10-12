import { DataAttr } from "@/common/constants/dom";
import { TooltipVariant } from "@/common/enums";

const TOOLTIP_SELECTOR = `[${DataAttr.TOOLTIP}], [${DataAttr.TOOLTIP_RICH}]`;

/** The props that give an element a tooltip. */
export function tooltip(
  text: string | undefined | null,
  variant: TooltipVariant = TooltipVariant.TEXT,
) {
  if (!text?.trim()) {
    return {};
  }

  return {
    [DataAttr.TOOLTIP]: text,
    [DataAttr.TOOLTIP_VARIANT]: variant,
  };
}

export function tooltipTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const element = target.closest<HTMLElement>(TOOLTIP_SELECTOR);
  if (!element) {
    return null;
  }

  return element.hasAttribute(DataAttr.TOOLTIP_RICH) ||
    element.getAttribute(DataAttr.TOOLTIP)?.trim()
    ? element
    : null;
}
