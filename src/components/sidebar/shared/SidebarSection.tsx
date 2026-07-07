import { CssClass } from "@/common/constants/css";
import { SidebarSectionChevronIcon } from "@/components/icons";
import type { ReactNode } from "react";
import "./SidebarSection.css";

interface Props {
  id: string;
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function SidebarSection({
  id,
  title,
  collapsed,
  onToggle,
  children,
}: Props) {
  return (
    <div
      id={id}
      className={`sidebar-section${collapsed ? ` ${CssClass.COLLAPSED}` : ""}`}
    >
      <div className="sidebar-section-header no-user-select" onClick={onToggle}>
        <p className="section-title">{title}</p>
        <SidebarSectionChevronIcon className="sidebar-section-chevron icon-md icon-bold" />
      </div>
      <div className="sidebar-section-body-wrapper">
        <div className="sidebar-section-body">
          <div className="sidebar-section-scroll">{children}</div>
        </div>
      </div>
    </div>
  );
}
