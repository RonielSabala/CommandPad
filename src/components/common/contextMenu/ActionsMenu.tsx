import { classNames } from "@/utils/string";
import { useRef, useState, type ReactNode } from "react";
import { ThreeDotsVertical } from "react-bootstrap-icons";
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
}

export function ActionsMenu({
  title,
  children,
  className,
  align = ContextMenuAlign.START,
  triggerClassName = "btn btn-flat-icon",
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
        title={title}
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
      >
        <ThreeDotsVertical className="icon-md" />
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
