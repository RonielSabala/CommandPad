import { CssClass } from "@/common/constants/css";
import { useRichTooltip } from "@/components/common/tooltip/richTooltip";
import { useRef, type ReactNode } from "react";

import { InfoDismissContext } from "./infoTooltipContext";

/** An info bubble pinned on an actions menu's trigger, or on `anchor`. */
export function useInfoTooltip() {
  const tip = useRichTooltip();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return {
    triggerRef,
    menuClassName: tip.pinned ? CssClass.MENU_OPEN : undefined,
    open: (anchor?: HTMLElement | null) => {
      const target = anchor ?? triggerRef.current;
      if (target) {
        tip.open(target);
      }
    },
    render: (content: () => ReactNode) =>
      tip.render(({ hide }) => (
        <InfoDismissContext.Provider value={hide}>
          {content()}
        </InfoDismissContext.Provider>
      )),
  };
}
