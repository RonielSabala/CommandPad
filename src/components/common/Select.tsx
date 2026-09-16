import { SelectConfig } from "@/common/config";
import { SelectSelector } from "@/common/constants/dom";
import { EventType, Key } from "@/common/constants/events";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { SidebarSectionChevronIcon } from "@/components/icons";
import { useStore } from "@/store/store";
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
  optionAction?: (value: T) => ReactNode;
  empty?: ReactNode;
  footer?: ReactNode;
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
  optionAction,
  empty,
  footer,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>();
  const mode = useStore((state) => state.mode);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const optionCountRef = useRef(options.length);
  const scrollable = options.length > SelectConfig.MAX_VISIBLE_OPTIONS;

  useEffect(() => {
    setOpen(false);
  }, [mode]);

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

    const onScroll = portal
      ? (event: Event) => {
          if (!menuRef.current?.contains(event.target as Node)) {
            setOpen(false);
          }
        }
      : null;

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

  // Clamp the menu
  useLayoutEffect(() => {
    const menu = menuRef.current;
    const grew = options.length > optionCountRef.current;
    optionCountRef.current = options.length;

    if (!menu) {
      return;
    }

    const { scrollTop } = menu;
    menu.style.maxHeight = "";

    if (!scrollable) {
      return;
    }

    const rows = menu.querySelectorAll<HTMLElement>(SelectSelector.OPTION);
    const lastVisible = rows[SelectConfig.MAX_VISIBLE_OPTIONS - 1];
    const clipped =
      rows[rows.length - 1].getBoundingClientRect().bottom -
      lastVisible.getBoundingClientRect().bottom;

    menu.style.maxHeight = `${menu.offsetHeight - clipped}px`;
    menu.scrollTop = grew ? menu.scrollHeight : scrollTop;
  }, [open, scrollable, options]);

  // Open on the current value when it sits past the fold
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!open || !menu) {
      return;
    }

    const selected = menu.querySelector<HTMLElement>(
      SelectSelector.SELECTED_OPTION,
    );
    if (
      selected &&
      selected.offsetTop + selected.offsetHeight > menu.clientHeight
    ) {
      menu.scrollTop = selected.offsetTop;
    }
  }, [open]);

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
        scrollable && "is-scrollable",
      )}
      style={portal ? menuStyle : undefined}
      role="listbox"
    >
      {options.length === 0 && empty && (
        <li className="select-empty no-user-select">{empty}</li>
      )}

      {options.map((option) => (
        <li
          key={option.value}
          className={classNames(
            "no-user-select",
            optionAction && "select-option-row",
          )}
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

          {optionAction?.(option.value)}
        </li>
      ))}

      {footer && <li className="select-footer">{footer}</li>}
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
