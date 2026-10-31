import { SelectConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { AriaRole, SelectSelector } from "@/common/constants/dom";
import { EventType, Key } from "@/common/constants/events";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { SidebarSectionChevronIcon } from "@/components/icons";
import { useStore } from "@/store/store";
import { toPx } from "@/utils/dom";
import { classNames } from "@/utils/string";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type LiHTMLAttributes,
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

export interface SelectOptionRowProps<T extends string> {
  value: T;
  rowProps: LiHTMLAttributes<HTMLLIElement>;
  children: ReactNode;
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
  optionRow?: ComponentType<SelectOptionRowProps<T>>;
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
  optionRow: OptionRow,
  empty,
  footer,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>();
  const mode = useStore((state) => state.mode);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
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
        !menuRef.current?.contains(target) &&
        !(target as Element).closest?.(SelectSelector.NESTED_POPUP)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === Key.ESCAPE &&
        !document.querySelector(SelectSelector.NESTED_POPUP)
      ) {
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

  // Clamp the option list
  useLayoutEffect(() => {
    const list = listRef.current;
    const grew = options.length > optionCountRef.current;
    optionCountRef.current = options.length;

    if (!list) {
      return;
    }

    const { scrollTop } = list;
    list.style.maxHeight = "";

    if (!scrollable) {
      return;
    }

    const rows = list.querySelectorAll<HTMLElement>(SelectSelector.OPTION);
    const lastVisible = rows[SelectConfig.MAX_VISIBLE_OPTIONS - 1];
    const clipped =
      rows[rows.length - 1].getBoundingClientRect().bottom -
      lastVisible.getBoundingClientRect().bottom;

    list.style.maxHeight = toPx(list.offsetHeight - clipped);
    list.scrollTop = grew ? list.scrollHeight : scrollTop;
  }, [open, scrollable, options]);

  // Open on the current value when it sits past the fold
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!open || !list) {
      return;
    }

    const selected = list.querySelector<HTMLElement>(
      SelectSelector.SELECTED_OPTION,
    );
    if (
      selected &&
      selected.offsetTop + selected.offsetHeight > list.clientHeight
    ) {
      list.scrollTop = selected.offsetTop;
    }
  }, [open]);

  const select = (next: T) => {
    onChange(next);
    setOpen(false);
  };

  const menu = open && (
    <div
      ref={menuRef}
      className={classNames(
        CssClass.SELECT_MENU,
        portal ? CssClass.SELECT_MENU_PORTAL : `align-${align}`,
      )}
      style={portal ? menuStyle : undefined}
    >
      <ul
        ref={listRef}
        className={classNames("select-list", scrollable && "is-scrollable")}
        role={AriaRole.LISTBOX}
      >
        {options.length === 0 && empty && (
          <li className={classNames("select-empty", CssClass.NO_USER_SELECT)}>
            {empty}
          </li>
        )}

        {options.map((option) => {
          const rowProps: LiHTMLAttributes<HTMLLIElement> = {
            className: classNames(
              CssClass.NO_USER_SELECT,
              OptionRow && "select-option-row",
            ),
            role: AriaRole.OPTION,
            "aria-selected": option.value === value,
          };

          const button = (
            <button
              className={classNames(
                CssClass.SELECT_OPTION,
                option.value === value && CssClass.IS_SELECTED,
              )}
              onClick={() => select(option.value)}
            >
              {option.label}
            </button>
          );

          return OptionRow ? (
            <OptionRow
              key={option.value}
              value={option.value}
              rowProps={rowProps}
            >
              {button}
            </OptionRow>
          ) : (
            <li key={option.value} {...rowProps}>
              {button}
            </li>
          );
        })}
      </ul>

      {footer && <div className="select-footer">{footer}</div>}
    </div>
  );

  return (
    <div className={classNames("select", className)} ref={rootRef}>
      <button
        className={triggerClassName}
        {...tooltip(title)}
        aria-haspopup={AriaRole.LISTBOX}
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        {children}
        <SidebarSectionChevronIcon
          className={classNames(
            "select-chevron",
            open && "is-open",
            CssClass.ICON_MD,
            CssClass.ICON_BOLD,
          )}
        />
      </button>

      {portal && menu ? createPortal(menu, document.body) : menu}
    </div>
  );
}
