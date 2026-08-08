import { PanelId } from "@/common/enums";
import { ResizablePanel } from "@/components/common/panel/ResizablePanel";
import { Footer } from "./Footer";
import { RunbookSection } from "./runbooks/RunbookSection";
import "./Sidebar.css";
import { VariableSection } from "./variables/VariableSection";

export function Sidebar() {
  return (
    <ResizablePanel panelId={PanelId.SIDEBAR} id="app-sidebar">
      <RunbookSection />
      <div className="sidebar-section-divider" />
      <VariableSection />

      <Footer />
    </ResizablePanel>
  );
}
