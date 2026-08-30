import { DataAttr } from "@/common/constants/dom";
import { TooltipVariant } from "@/common/enums";

/** The props that give an element a tooltip. */
export function tooltip(
  text: string | undefined | null,
  variant: TooltipVariant = TooltipVariant.TEXT,
) {
  if (!text) {
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

  const element = target.closest<HTMLElement>(`[${DataAttr.TOOLTIP}]`);
  return element?.getAttribute(DataAttr.TOOLTIP) ? element : null;
}
