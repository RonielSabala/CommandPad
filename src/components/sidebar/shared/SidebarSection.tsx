import { SECTION_ANIMATION_FALLBACK_MS } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { Key } from "@/common/constants/events";
import { SidebarSectionChevronIcon } from "@/components/icons";
import type { FileDrop } from "@/hooks/useFileDrop";
import { classNames } from "@/utils/string";
import { useEffect, useState, type ReactNode } from "react";
import "./SidebarSection.css";

interface DropZone extends FileDrop {
  hint: string;
}

interface Props {
  id: string;
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  dropZone?: DropZone;
  children: ReactNode;
}

export function SidebarSection({
  id,
  title,
  collapsed,
  onToggle,
  dropZone,
  children,
}: Props) {
  const [animating, setAnimating] = useState(false);
  const [prevCollapsed, setPrevCollapsed] = useState(collapsed);
  if (prevCollapsed !== collapsed) {
    setPrevCollapsed(collapsed);
    setAnimating(true);
  }

  useEffect(() => {
    if (!animating) {
      return;
    }

    const timer = window.setTimeout(
      () => setAnimating(false),
      SECTION_ANIMATION_FALLBACK_MS,
    );
    return () => window.clearTimeout(timer);
  }, [animating]);

  const classes = classNames(
    "sidebar-section",
    collapsed && CssClass.COLLAPSED,
    animating && CssClass.ANIMATING,
    dropZone?.isDropActive && CssClass.DROP_TARGET,
  );

  return (
    <div id={id} className={classes} {...dropZone?.dropProps}>
      {dropZone?.isDropActive && (
        <div className="sidebar-section-drop-overlay no-user-select">
          {dropZone.hint}
        </div>
      )}
      <div
        className="sidebar-section-header no-user-select"
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === Key.ENTER || event.key === Key.SPACE) {
            event.preventDefault();
            onToggle();
          }
        }}
      >
        <p className="section-title">{title}</p>
        <SidebarSectionChevronIcon className="sidebar-section-chevron icon-md icon-bold" />
      </div>
      <div
        className="sidebar-section-body-wrapper"
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget) {
            setAnimating(false);
          }
        }}
      >
        <div className="sidebar-section-body">
          <div className="sidebar-section-scroll">{children}</div>
        </div>
      </div>
    </div>
  );
}
