import { SidebarPosition } from "@/common/enums";
import { useStore } from "@/store/store";
import "./SidebarActions.css";

export function SidebarActions() {
  const isSidebarCollapsed = useStore((state) => state.sidebarCollapsed);
  const sidebarPosition = useStore((state) => state.sidebarPosition);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const toggleSidebarPosition = useStore(
    (state) => state.toggleSidebarPosition,
  );

  return (
    <div id="sidebar-btn-group">
      <button
        id="sidebar-toggle-btn"
        className="btn btn-icon"
        onClick={toggleSidebar}
        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg id="sidebar-chevron" viewBox="0 0 16 16">
          <polyline points="10,4 4,8 10,12" />
        </svg>
      </button>
      <button
        className="btn btn-icon"
        onClick={toggleSidebarPosition}
        title={`Move sidebar to ${sidebarPosition === SidebarPosition.RIGHT ? "left" : "right"}`}
      >
        <svg viewBox="0 0 16 16">
          <rect x="1" y="2" width="14" height="12" rx="1" />
          <line x1="11" y1="2" x2="11" y2="14" />
        </svg>
      </button>
    </div>
  );
}
