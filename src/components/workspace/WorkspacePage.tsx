import { PanelId } from "@/common/enums";
import { PanelShell } from "@/components/common/panel/PanelShell";
import { useBlockSelection } from "@/hooks/useBlockSelection";
import { useWorkspaceBodyClasses } from "@/hooks/useBodyClasses";
import { useDocumentInteractions } from "@/hooks/useDocumentInteractions";
import { useKeybindings } from "@/hooks/useKeybindings";
import { useLinkActivation } from "@/hooks/useLinkActivation";
import { usePanelKeybindings } from "@/hooks/usePanelKeybindings";
import { ImageLightbox } from "../blocks/image/ImageLightbox";
import { Header } from "../header/Header";
import { CloudFileEditorModal } from "../modals/cloud/CloudFileEditorModal";
import { CloudImportModal } from "../modals/cloud/CloudImportModal";
import { DestinationModal } from "../modals/DestinationModal";
import { AlertModal } from "../modals/dialogs/AlertModal";
import { ConfirmModal } from "../modals/dialogs/ConfirmModal";
import { ExportModal } from "../modals/ExportModal";
import { PasteRunbookModal } from "../modals/PasteRunbookModal";
import { RunbookImportInput } from "../sidebar/runbooks/RunbookImportInput";
import { Sidebar } from "../sidebar/Sidebar";
import { MainPanel } from "./MainPanel";

export function WorkspacePage() {
  useWorkspaceBodyClasses();
  useKeybindings();
  usePanelKeybindings(PanelId.SIDEBAR);
  useDocumentInteractions();
  useBlockSelection(document);
  useLinkActivation(document);

  return (
    <>
      <PanelShell panelId={PanelId.SIDEBAR} id="app-shell">
        <Header />
        <Sidebar />
        <RunbookImportInput />
        <MainPanel />
      </PanelShell>

      <ImageLightbox />
      <ExportModal />
      <PasteRunbookModal />
      <DestinationModal />
      <CloudImportModal />
      <CloudFileEditorModal />
      <ConfirmModal />
      <AlertModal />
    </>
  );
}
