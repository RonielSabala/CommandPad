import { CssClass } from "@/common/constants/css";
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
        <svg className="sidebar-section-chevron" viewBox="0 0 16 16">
          <polyline points="4,6 8,10 12,6" />
        </svg>
      </div>
      <div className="sidebar-section-body">{children}</div>
    </div>
  );
}
