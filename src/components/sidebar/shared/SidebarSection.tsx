import { SECTION_ANIMATION_FALLBACK_MS } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { asButton } from "@/components/common/asButton";
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

  return (
    <div
      id={id}
      className={classNames(
        "panel-card",
        "sidebar-section",
        collapsed && CssClass.COLLAPSED,
        animating && CssClass.ANIMATING,
        dropZone?.isDropActive && CssClass.DROP_TARGET,
      )}
      {...dropZone?.dropProps}
    >
      {dropZone?.isDropActive && (
        <div
          className={classNames(
            "sidebar-section-drop-overlay",
            CssClass.NO_USER_SELECT,
          )}
        >
          {dropZone.hint}
        </div>
      )}
      <div
        className={classNames(
          "sidebar-section-header",
          CssClass.NO_USER_SELECT,
        )}
        aria-expanded={!collapsed}
        {...asButton(onToggle)}
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
