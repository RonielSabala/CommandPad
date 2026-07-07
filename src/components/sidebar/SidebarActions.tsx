import { SidebarPosition } from "@/common/enums";
import { SidebarCollapseIcon, SidebarPositionIcon } from "@/components/icons";
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
        <SidebarCollapseIcon
          id="sidebar-chevron"
          className="icon-md icon-bold"
        />
      </button>
      <button
        className="btn btn-icon"
        onClick={toggleSidebarPosition}
        title={`Move sidebar to ${sidebarPosition === SidebarPosition.RIGHT ? "left" : "right"}`}
      >
        <SidebarPositionIcon className="icon-md icon-bold" />
      </button>
    </div>
  );
}
