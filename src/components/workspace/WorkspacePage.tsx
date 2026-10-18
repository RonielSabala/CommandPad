import { PanelId, SelectionGroup } from "@/common/enums";
import { PanelShell } from "@/components/common/panel/PanelShell";
import { useWorkspaceBodyClasses } from "@/hooks/useBodyClasses";
import { useDocumentInteractions } from "@/hooks/useDocumentInteractions";
import { useKeybindings } from "@/hooks/useKeybindings";
import { useLassoSelection } from "@/hooks/useLassoSelection";
import { useLinkActivation } from "@/hooks/useLinkActivation";

import { ImageLightbox } from "../blocks/image/ImageLightbox";
import { Header } from "../header/Header";
import { CloudConflictModal } from "../modals/cloud/CloudConflictModal";
import { CloudFileEditorModal } from "../modals/cloud/CloudFileEditorModal";
import { CloudImportModal } from "../modals/cloud/CloudImportModal";
import { DestinationModal } from "../modals/DestinationModal";
import { AlertModal } from "../modals/dialogs/AlertModal";
import { ConfirmModal } from "../modals/dialogs/ConfirmModal";
import { ExportModal } from "../modals/ExportModal";
import { PasteRunbookModal } from "../modals/PasteRunbookModal";
import { VaultModal } from "../modals/vault/VaultModal";
import { RunbookImportInput } from "../sidebar/runbooks/RunbookImportInput";
import { Sidebar } from "../sidebar/Sidebar";
import { MainPanel } from "./MainPanel";
import { SaveNotice } from "./SaveNotice";
import { SelectionCount } from "./SelectionCount";

export function WorkspacePage() {
  useWorkspaceBodyClasses();
  useKeybindings();
  useDocumentInteractions();
  useLassoSelection(document, SelectionGroup.BLOCK);
  useLinkActivation(document);

  return (
    <>
      <PanelShell panelId={PanelId.SIDEBAR} id="app-shell">
        <Header />
        <Sidebar />
        <RunbookImportInput />
        <MainPanel />
        <SelectionCount />
      </PanelShell>

      <ImageLightbox />
      <ExportModal />
      <PasteRunbookModal />
      <DestinationModal />
      <CloudImportModal />
      <CloudFileEditorModal />
      <CloudConflictModal />
      <VaultModal />
      <ConfirmModal />
      <AlertModal />
      <SaveNotice />
    </>
  );
}
