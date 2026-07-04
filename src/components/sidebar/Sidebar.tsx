import { Footer } from "./Footer";
import { RunbookSection } from "./RunbookSection";
import "./Sidebar.css";
import { VariableSection } from "./VariableSection";

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
