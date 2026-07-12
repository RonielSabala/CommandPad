import { useSidebarResize } from "@/hooks/useSidebarResize";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { Footer } from "./Footer";
import { RunbookSection } from "./runbooks/RunbookSection";
import "./Sidebar.css";
import { SidebarActions } from "./SidebarActions";
import { VariableSection } from "./variables/VariableSection";

export function Sidebar() {
  const t = useTranslation();
  const { onPointerDown, onDoubleClick } = useSidebarResize();
  const isSidebarCollapsed = useStore((state) => state.sidebarCollapsed);

  return (
    <aside id="app-sidebar">
      <div id="sidebar-content">
        <RunbookSection />
        <div className="sidebar-section-divider" />
        <VariableSection />
        <Footer />
      </div>

      <div
        id="sidebar-resize-handle"
        className="no-user-select"
        onPointerDown={onPointerDown}
        onDoubleClick={onDoubleClick}
        title={
          isSidebarCollapsed
            ? t.sidebar.doubleClickExpand
            : t.sidebar.dragResizeCollapse
        }
      >
        <SidebarActions />
      </div>
    </aside>
  );
}
