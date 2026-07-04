import "./Sidebar.css";

import { ElementId } from "@/common/constants/dom";
import { Footer } from "./Footer";
import { RunbookSection } from "./RunbookSection";
import { VariableSection } from "./VariableSection";

export function Sidebar() {
  return (
    <aside id={ElementId.APP_SIDEBAR}>
      <RunbookSection />
      <div className="sidebar-section-divider" />
      <VariableSection />
      <Footer />
    </aside>
  );
}
