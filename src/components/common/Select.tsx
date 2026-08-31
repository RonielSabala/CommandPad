import { EventType, Key } from "@/common/constants/events";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { SidebarSectionChevronIcon } from "@/components/icons";
import { classNames } from "@/utils/string";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import "./Select.css";

export const SelectAlign = {
  START: "start",
  END: "end",
} as const;
export type SelectAlign = (typeof SelectAlign)[keyof typeof SelectAlign];

export interface SelectOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SelectProps<T extends string> {
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  children: ReactNode;
  className?: string;
  triggerClassName?: string;
  align?: SelectAlign;
  title?: string;
  portal?: boolean;
}

export function Select<T extends string>({
  value,
  options,
  onChange,
  children,
  className,
  triggerClassName,
  align = SelectAlign.END,
  title,
  portal = false,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === Key.ESCAPE) {
        setOpen(false);
      }
    };

    document.addEventListener(EventType.MOUSE_DOWN, onMouseDown);
    document.addEventListener(EventType.KEY_DOWN, onKeyDown);

    const onScroll = portal ? () => setOpen(false) : null;
    if (onScroll) {
      document.addEventListener(EventType.SCROLL, onScroll, true);
    }

    return () => {
      document.removeEventListener(EventType.MOUSE_DOWN, onMouseDown);
      document.removeEventListener(EventType.KEY_DOWN, onKeyDown);
      if (onScroll) {
        document.removeEventListener(EventType.SCROLL, onScroll, true);
      }
    };
  }, [open, portal]);

  useLayoutEffect(() => {
    if (!open || !portal) {
      return;
    }

    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuStyle({
        top: rect.bottom,
        minWidth: rect.width,
        ...(align === SelectAlign.END
          ? { right: window.innerWidth - rect.right }
          : { left: rect.left }),
      });
    }
  }, [open, portal, align]);

  const select = (next: T) => {
    onChange(next);
    setOpen(false);
  };

  const menu = open && (
    <ul
      ref={menuRef}
      className={classNames(
        "select-menu",
        portal ? "select-menu-portal" : `align-${align}`,
      )}
      style={portal ? menuStyle : undefined}
      role="listbox"
    >
      {options.map((option) => (
        <li
          key={option.value}
          className="no-user-select"
          role="option"
          aria-selected={option.value === value}
        >
          <button
            className={classNames(
              "select-option",
              option.value === value && "is-selected",
            )}
            onClick={() => select(option.value)}
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={classNames("select", className)} ref={rootRef}>
      <button
        className={triggerClassName}
        {...tooltip(title)}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        {children}
        <SidebarSectionChevronIcon
          className={classNames(
            "select-chevron icon-md icon-bold",
            open && "is-open",
          )}
        />
      </button>

      {portal && menu ? createPortal(menu, document.body) : menu}
    </div>
  );
}
