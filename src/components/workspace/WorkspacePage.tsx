import { SidebarPosition } from "@/common/enums";
import { useBlockSelection } from "@/hooks/useBlockSelection";
import { useWorkspaceBodyClasses } from "@/hooks/useBodyClasses";
import { useDocumentInteractions } from "@/hooks/useDocumentInteractions";
import { useKeybindings } from "@/hooks/useKeybindings";
import { useLinkActivation } from "@/hooks/useLinkActivation";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import type { CSSProperties } from "react";
import { Header } from "../header/Header";
import { MainPanel } from "../MainPanel";
import { AlertModal } from "../modals/AlertModal";
import { ConfirmModal } from "../modals/ConfirmModal";
import { ExportModal } from "../modals/ExportModal";
import { PasteRunbookModal } from "../modals/PasteRunbookModal";
import { RunbookImportInput } from "../sidebar/runbooks/RunbookImportInput";
import { Sidebar } from "../sidebar/Sidebar";

export function WorkspacePage() {
  const sidebarPosition = useStore((state) => state.sidebarPosition);
  const isSidebarCollapsed = useStore((state) => state.sidebarCollapsed);
  const sidebarWidth = useStore((state) => state.sidebarWidth);

  useWorkspaceBodyClasses();
  useKeybindings();
  useDocumentInteractions();
  useBlockSelection(document);
  useLinkActivation(document);

  const shellClass = classNames(
    "grid-shell",
    isSidebarCollapsed && "sidebar-collapsed",
    sidebarPosition === SidebarPosition.RIGHT && "sidebar-right",
  );

  return (
    <>
      <div
        id="app-shell"
        className={shellClass}
        style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
      >
        <Header />
        <Sidebar />
        <RunbookImportInput />
        <MainPanel />
      </div>

      <ExportModal />
      <PasteRunbookModal />
      <ConfirmModal />
      <AlertModal />
    </>
  );
}
