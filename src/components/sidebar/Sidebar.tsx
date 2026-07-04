import { Footer } from "./Footer";
import { RunbookSection } from "./runbooks/RunbookSection";
import "./Sidebar.css";
import { VariableSection } from "./variables/VariableSection";

export function Sidebar() {
  return (
    <aside id="app-sidebar">
      <RunbookSection />
      <div className="sidebar-section-divider" />
      <VariableSection />
      <Footer />
    </aside>
  );
}
