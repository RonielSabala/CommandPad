import { SidebarPosition } from "@/common/enums";
import { SidebarCollapseIcon, SidebarPositionIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import "./SidebarActions.css";

export function SidebarActions() {
  const t = useTranslation();
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
        title={isSidebarCollapsed ? t.sidebar.expand : t.sidebar.collapse}
      >
        <SidebarCollapseIcon
          id="sidebar-chevron"
          className="icon-md icon-bold"
        />
      </button>
      <button
        className="btn btn-icon"
        onClick={toggleSidebarPosition}
        title={
          sidebarPosition === SidebarPosition.RIGHT
            ? t.sidebar.moveLeft
            : t.sidebar.moveRight
        }
      >
        <SidebarPositionIcon
          className="icon-md icon-bold"
          mirrored={sidebarPosition === SidebarPosition.RIGHT}
        />
      </button>
    </div>
  );
}
