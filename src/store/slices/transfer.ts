import { FilePickerConfig } from "@/common/config";
import {
  AppMode,
  CloudExportStatus,
  DialogTone,
  ExportFormat,
  SyncDestination,
} from "@/common/enums";
import { getMessages } from "@/i18n/messages";
import { clearCachedCloudEntries, getCloudClient } from "@/services/cloud";
import {
  buildMarkdownExport,
  buildSecuredRunbookExportContent,
  getExportBasename,
  runExport,
} from "@/utils/export";
import { sha256 } from "@/utils/hash";
import { openImportDialog } from "@/utils/importTrigger";

import { ROOT_CLOUD_PATH } from "@/store/cloudPaths";
import type { StoreKit } from "@/store/kit";
import { getActiveTab } from "@/store/selectors";
import type { StoreServices } from "@/store/services";
import { tabContent } from "@/store/tabState";
import type { StoreState } from "@/store/types";
import { uiStateSnapshot } from "@/store/uiState";

type TransferActions = Pick<
  StoreState,
  | "openExportModal"
  | "closeExportModal"
  | "resetCloudExportStatus"
  | "setExportDestination"
  | "setExportFormat"
  | "setExportFilename"
  | "setExportFolderPath"
  | "openPasteRunbookModal"
  | "closePasteRunbookModal"
  | "exportRunbook"
  | "beginImport"
  | "openDestinationModal"
  | "closeDestinationModal"
  | "chooseDestination"
  | "copyRunbookMarkdown"
>;

export function createTransferSlice(
  kit: StoreKit,
  services: StoreServices,
): TransferActions {
  const { set, get, persist, debouncedSaveState } = kit;
  const { linkRunbookToCloud, readEmbeddedForExport, ensureSignedIn } =
    services;

  return {
    openExportModal: () => {
      const state = get();
      const activeTab = getActiveTab(state);
      const activeTabId = activeTab?.id ?? null;

      set({
        exportModalOpen: true,
        cloudExportStatus: CloudExportStatus.IDLE,
        ...(state.lastExportFilenameTabId !== activeTabId
          ? {
              lastExportFilename: getExportBasename(activeTab?.label ?? ""),
              lastExportFilenameTabId: activeTabId,
            }
          : {}),
      });
    },
    closeExportModal: () => set({ exportModalOpen: false }),
    resetCloudExportStatus: () =>
      set({ cloudExportStatus: CloudExportStatus.IDLE }),

    setExportDestination: (destination) => {
      set({
        lastExportDestination: destination,
        lastExportFolderPath: ROOT_CLOUD_PATH,
      });
      persist.saveUiState(uiStateSnapshot(get()));
    },
    setExportFormat: (format) => {
      set({ lastExportFormat: format });
      persist.saveUiState(uiStateSnapshot(get()));
    },
    setExportFilename: (filename) => {
      set({
        lastExportFilename: filename,
        lastExportFilenameTabId: getActiveTab(get())?.id ?? null,
      });
      debouncedSaveState();
    },
    setExportFolderPath: (path) => {
      set({ lastExportFolderPath: path });
      persist.saveUiState(uiStateSnapshot(get()));
    },

    openPasteRunbookModal: () => set({ pasteRunbookModalOpen: true }),
    closePasteRunbookModal: () => set({ pasteRunbookModalOpen: false }),

    exportRunbook: async (destination, format, filename, folderId) => {
      set({
        lastExportDestination: destination,
        lastExportFormat: format,
      });

      const active = getActiveTab(get());
      const content = tabContent(active);

      const scope = active?.runbookId ?? "";
      const fullName = `${filename}.${format}`;

      // Local export
      if (destination === SyncDestination.LOCAL) {
        set({ exportModalOpen: false });
        await runExport(
          format,
          scope,
          content,
          fullName,
          readEmbeddedForExport,
        );
        return;
      }

      // Cloud export
      set({
        cloudExportStatus: CloudExportStatus.UPLOADING,
        cloudExportProvider: destination,
      });

      const client = getCloudClient(destination);
      try {
        await ensureSignedIn(client);

        // A same-named file in the target folder is replaced, so ask first
        if (await client.fileExists(fullName, folderId)) {
          const t = getMessages(get().language);
          set({ cloudExportStatus: CloudExportStatus.IDLE });

          const confirmed = await get().confirm(
            t.dialogs.overwriteCloudFileMessage(fullName),
            {
              title: t.dialogs.overwriteCloudFileTitle,
              confirmLabel: t.dialogs.overwriteCloudFileConfirm,
              tone: DialogTone.WARNING,
            },
          );

          if (!confirmed) {
            return;
          }

          set({ cloudExportStatus: CloudExportStatus.UPLOADING });
        }

        const written = await buildSecuredRunbookExportContent(
          format,
          scope,
          content,
          readEmbeddedForExport,
        );
        await client.writeFile(
          fullName,
          written,
          FilePickerConfig[format].mimeType,
          folderId,
        );

        // JSON is the only worth linking format
        if (format === ExportFormat.JSON && active?.runbookId) {
          linkRunbookToCloud(
            active.runbookId,
            {
              provider: destination,
              filename: fullName,
              folderId,
              revision: sha256(written),
            },
            content,
          );
        }

        // The destination folder now holds a file no cached listing has
        clearCachedCloudEntries(destination);
        set({ cloudExportStatus: CloudExportStatus.SUCCESS });
      } catch (error) {
        console.error("Cloud export failed", error);
        set({ cloudExportStatus: CloudExportStatus.ERROR });
      }
    },

    beginImport: () => {
      if (get().mode === AppMode.READ) {
        return;
      }

      const source = get().lastImportSource;
      if (source === SyncDestination.LOCAL) {
        get().openDestinationModal();
        return;
      }

      void get().startCloudImportBrowse(source);
    },

    openDestinationModal: () => {
      if (get().mode === AppMode.READ) {
        return;
      }

      set({ destinationModalOpen: true });
    },
    closeDestinationModal: () => set({ destinationModalOpen: false }),

    chooseDestination: (destination) => {
      set({
        destinationModalOpen: false,
        cloudImportModalOpen: false,
        lastImportSource: destination,
      });
      persist.saveUiState(uiStateSnapshot(get()));

      if (destination === SyncDestination.LOCAL) {
        openImportDialog();
        return;
      }

      void get().startCloudImportBrowse(destination);
    },

    copyRunbookMarkdown: async () => {
      const active = getActiveTab(get());
      const text = await buildMarkdownExport(
        active?.runbookId ?? "",
        tabContent(active),
        readEmbeddedForExport,
      );

      await navigator.clipboard.writeText(text);
    },
  };
}
