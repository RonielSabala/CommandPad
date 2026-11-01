import { CssClass } from "@/common/constants/css";
import { AriaRole } from "@/common/constants/dom";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { classNames } from "@/utils/string";
import { useRef, useState, type ReactNode } from "react";
import { ThreeDots, ThreeDotsVertical } from "react-bootstrap-icons";

import {
  ContextMenu,
  ContextMenuAlign,
  type ContextMenuAnchor,
} from "./ContextMenu";

interface Props {
  title: string;
  children: ReactNode;
  className?: string;
  align?: ContextMenuAlign;
  triggerClassName?: string;
  horizontal?: boolean;
  /** Opens beside the trigger's closest match instead of below the trigger. */
  besideSelector?: string;
}

export function ActionsMenu({
  title,
  children,
  className,
  align = ContextMenuAlign.START,
  triggerClassName = classNames(CssClass.BTN, CssClass.BTN_FLAT_ICON),
  horizontal = false,
  besideSelector,
}: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState<ContextMenuAnchor | null>(null);

  const toggle = () => {
    const trigger = triggerRef.current;

    if (anchor !== null || !trigger) {
      setAnchor(null);
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const container = besideSelector && trigger.closest(besideSelector);
    if (container) {
      const box = container.getBoundingClientRect();
      setAnchor({ x: box.right, y: rect.top, flipX: box.left });
      return;
    }

    setAnchor({
      x: align === ContextMenuAlign.END ? rect.right : rect.left,
      y: rect.bottom,
    });
  };

  return (
    <div
      className={classNames(className, anchor && "menu-open")}
      onMouseDown={(event) => event.preventDefault()}
    >
      <button
        ref={triggerRef}
        className={triggerClassName}
        onClick={toggle}
        aria-label={title}
        {...tooltip(title)}
        aria-haspopup={AriaRole.MENU}
        aria-expanded={anchor !== null}
      >
        {horizontal ? (
          <ThreeDots className={CssClass.ICON_MD} />
        ) : (
          <ThreeDotsVertical className={CssClass.ICON_MD} />
        )}
      </button>

      {anchor && (
        <ContextMenu
          anchor={anchor}
          align={align}
          triggerRef={triggerRef}
          onClose={() => setAnchor(null)}
        >
          {children}
        </ContextMenu>
      )}
    </div>
  );
}
