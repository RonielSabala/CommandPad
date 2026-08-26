import { EventType, Key } from "@/common/constants/events";
import { SidebarSectionChevronIcon } from "@/components/icons";
import { classNames } from "@/utils/string";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
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
    return () => {
      document.removeEventListener(EventType.MOUSE_DOWN, onMouseDown);
      document.removeEventListener(EventType.KEY_DOWN, onKeyDown);
    };
  }, [open]);

  const select = (next: T) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div className={classNames("select", className)} ref={rootRef}>
      <button
        className={triggerClassName}
        title={title}
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

      {open && (
        <ul
          className={classNames("select-menu", `align-${align}`)}
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
      )}
    </div>
  );
}
