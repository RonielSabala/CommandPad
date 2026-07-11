import { SidebarPosition } from "@/common/enums";
import { useBodyClasses } from "@/hooks/useBodyClasses";
import { useDocumentInteractions } from "@/hooks/useDocumentInteractions";
import { useKeybindings } from "@/hooks/useKeybindings";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useEffect, type CSSProperties } from "react";
import "./App.css";
import { Header } from "./components/header/Header";
import { MainPanel } from "./components/MainPanel";
import { AlertModal } from "./components/modals/AlertModal";
import { ConfirmModal } from "./components/modals/ConfirmModal";
import { ExportModal } from "./components/modals/ExportModal";
import { KeybindingsModal } from "./components/modals/KeybindingsModal";
import { PasteRunbookModal } from "./components/modals/PasteRunbookModal";
import { RunbookImportInput } from "./components/sidebar/runbooks/RunbookImportInput";
import { Sidebar } from "./components/sidebar/Sidebar";

export default function App() {
  const bootstrap = useStore((state) => state.bootstrap);
  const sidebarPosition = useStore((state) => state.sidebarPosition);
  const isInitialized = useStore((state) => state.initialized);
  const isSidebarCollapsed = useStore((state) => state.sidebarCollapsed);
  const sidebarWidth = useStore((state) => state.sidebarWidth);

  useBodyClasses();
  useKeybindings();
  useDocumentInteractions();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (isInitialized) {
      requestAnimationFrame(() => document.body.classList.add("app-ready"));
    }
  }, [isInitialized]);

  const shellClass = classNames(
    isSidebarCollapsed && "sidebar-collapsed",
    sidebarPosition === SidebarPosition.RIGHT && "sidebar-right",
  );

  return (
    <>
      <div
        id="app-shell"
        className={shellClass}
        style={
          { "--sidebar-width": `${sidebarWidth}px` } as CSSProperties
        }
      >
        <Header />
        <Sidebar />
        <RunbookImportInput />
        <MainPanel />
      </div>

      <KeybindingsModal />
      <ExportModal />
      <PasteRunbookModal />
      <ConfirmModal />
      <AlertModal />
    </>
  );
}
