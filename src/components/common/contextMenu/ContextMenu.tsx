import { CssClass } from "@/common/constants/css";
import { EventType, Key } from "@/common/constants/events";
import { CheckIcon } from "@/components/icons";
import { classNames } from "@/utils/string";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import "./ContextMenu.css";
import { SubmenuActivationContext } from "./contextMenuActivation";

export const ContextMenuAlign = {
  START: "start",
  END: "end",
} as const;
export type ContextMenuAlign =
  (typeof ContextMenuAlign)[keyof typeof ContextMenuAlign];

export interface ContextMenuAnchor {
  x: number;
  y: number;
}

interface ContextMenuProps {
  anchor: ContextMenuAnchor;
  onClose: () => void;
  children: ReactNode;
  align?: ContextMenuAlign;
  triggerRef?: RefObject<HTMLElement | null>;
}

const CloseContext = createContext<(() => void) | null>(null);

export function ContextMenu({
  anchor,
  onClose,
  children,
  align = ContextMenuAlign.START,
  triggerRef,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(anchor);
  const [activeSubmenuId, setActiveSubmenuId] = useState<string | null>(null);

  // Keep the menu fully on screen
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) {
      return;
    }

    const x =
      align === ContextMenuAlign.END ? anchor.x - menu.offsetWidth : anchor.x;
    const maxX = window.innerWidth - menu.offsetWidth;
    const maxY = window.innerHeight - menu.offsetHeight;

    setPosition({
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(anchor.y, maxY)),
    });
  }, [anchor.x, anchor.y, align]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        !menuRef.current?.contains(target) &&
        !triggerRef?.current?.contains(target)
      ) {
        onClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === Key.ESCAPE) {
        onClose();
      }
    };

    document.addEventListener(EventType.POINTER_DOWN, onPointerDown);
    document.addEventListener(EventType.KEY_DOWN, onKeyDown);
    document.addEventListener(EventType.SCROLL, onClose, true);
    return () => {
      document.removeEventListener(EventType.POINTER_DOWN, onPointerDown);
      document.removeEventListener(EventType.KEY_DOWN, onKeyDown);
      document.removeEventListener(EventType.SCROLL, onClose, true);
    };
  }, [onClose, triggerRef]);

  return createPortal(
    <CloseContext.Provider value={onClose}>
      <SubmenuActivationContext.Provider
        value={{ activeId: activeSubmenuId, setActiveId: setActiveSubmenuId }}
      >
        <div
          className={classNames(CssClass.CONTEXT_MENU, "no-user-select")}
          ref={menuRef}
          role="menu"
          style={{ left: position.x, top: position.y }}
        >
          {children}
        </div>
      </SubmenuActivationContext.Provider>
    </CloseContext.Provider>,
    document.body,
  );
}

interface ContextMenuItemProps {
  children: ReactNode;
  onSelect: () => void;
  icon?: ReactNode;
  checked?: boolean;
  disabled?: boolean;
  danger?: boolean;
}

export function ContextMenuItem({
  children,
  onSelect,
  icon,
  checked,
  disabled,
  danger,
}: ContextMenuItemProps) {
  const close = useContext(CloseContext);
  const isCheckbox = checked !== undefined;

  return (
    <button
      className={classNames("context-menu-item", danger && "is-danger")}
      role={isCheckbox ? "menuitemcheckbox" : "menuitem"}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        onSelect();
        close?.();
      }}
    >
      <span className="context-menu-icon">
        {isCheckbox && checked ? (
          <CheckIcon className="icon-md icon-bold" />
        ) : (
          icon
        )}
      </span>
      {children}
    </button>
  );
}

export function ContextMenuSeparator() {
  return <div className="context-menu-separator" role="separator" />;
}
