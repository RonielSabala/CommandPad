import { CssClass } from "@/common/constants/css";
import { SidebarSectionChevronIcon } from "@/components/icons";
import { classNames } from "@/utils/string";
import { useState, type ReactNode } from "react";
import "./Collapsible.css";

interface CollapsibleProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A chevron-toggled expandable section. */
export function Collapsible({ title, children, className }: CollapsibleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={classNames("collapsible", className)}>
      <button
        className="collapsible-trigger"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <SidebarSectionChevronIcon
          className={classNames(
            "collapsible-chevron",
            open && "is-open",
            CssClass.ICON_MD,
            CssClass.ICON_BOLD,
          )}
        />
        {title}
      </button>

      {open && <div className="collapsible-panel">{children}</div>}
    </div>
  );
}
