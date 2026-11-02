import { CssClass } from "@/common/constants/css";
import { useRichTooltip } from "@/components/common/tooltip/richTooltip";
import { useRef, type ReactNode } from "react";

/** An info bubble pinned on an actions menu's trigger. */
export function useInfoTooltip() {
  const tip = useRichTooltip();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return {
    triggerRef,
    menuClassName: tip.pinned ? CssClass.MENU_OPEN : undefined,
    open: () => {
      if (triggerRef.current) {
        tip.open(triggerRef.current);
      }
    },
    render: (content: () => ReactNode) => tip.render(content),
  };
}
