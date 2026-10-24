import { CloudSyncConfig, MimeType, ZIP_EXTENSION } from "@/common/config";
import { DialogTone } from "@/common/enums";
import type { RunbookContent, RunbookSync } from "@/common/types";
import { getMessages } from "@/i18n/messages";
import {
  buildCloudEntriesZip,
  buildCloudFolderZip,
  buildDuplicateName,
  copyCloudEntry,
  getCloudClient,
  type CloudEntry,
} from "@/services/cloud";
import { downloadBlob } from "@/utils/download";
import { withJsonExtension } from "@/utils/export";
import { sha256 } from "@/utils/hash";
import { parseRunbookSource } from "@/utils/runbookSource";

import {
  currentFolderId,
  parentFolderId,
  parentFolderPath,
  siblingEntries,
} from "@/store/cloudPaths";
import type { StoreKit } from "@/store/kit";
import type { StoreServices } from "@/store/services";
import type { StoreState } from "@/store/types";

type CloudFilesActions = Pick<
  StoreState,
  | "createCloudFolder"
  | "setCloudSelection"
  | "toggleCloudSelected"
  | "clearCloudSelection"
  | "importRunbooksFromCloud"
  | "renameCloudEntry"
  | "openCloudFileEditor"
  | "setCloudFileEditorText"
  | "saveCloudFileEditor"
  | "closeCloudFileEditor"
  | "duplicateCloudEntries"
  | "downloadCloudEntries"
  | "deleteCloudEntries"
>;

export function createCloudFilesSlice(
  kit: StoreKit,
  services: StoreServices,
): CloudFilesActions {
  const { set, get } = kit;
  const { decryptImportedContent, addCloudRunbook, emptyCloudSelection } =
    services;

  return {
    createCloudFolder: async (name) => {
      const trimmed = name.trim();
      if (!trimmed) {
        return;
      }

      const t = getMessages(get().language);
      const taken = get().cloudEntries.some(
        (entry) => entry.name.toLowerCase() === trimmed.toLowerCase(),
      );

      if (taken) {
        set({ cloudError: t.cloudModal.nameTakenError(trimmed) });
        return;
      }

      const client = getCloudClient(get().cloudProvider);
      set({ cloudLoading: true, cloudError: null });
      try {
        await client.createFolder(trimmed, currentFolderId(get().cloudPath));
      } catch (error) {
        console.error("Cloud folder creation failed", error);
        set({
          cloudLoading: false,
          cloudError: t.cloudModal.createFolderError,
        });
        return;
      }

      set({ cloudLoading: false });
      await get().refreshCloudEntries();
    },

    setCloudSelection: (entries) =>
      set({
        cloudSelectedEntries: new Map(
          entries.map((entry) => [
            entry.id,
            { entry, path: parentFolderPath(get(), entry) },
          ]),
        ),
      }),

    toggleCloudSelected: (entry) =>
      set((s) => {
        const cloudSelectedEntries = new Map(s.cloudSelectedEntries);
        if (!cloudSelectedEntries.delete(entry.id)) {
          cloudSelectedEntries.set(entry.id, {
            entry,
            path: parentFolderPath(s, entry),
          });
        }

        return { cloudSelectedEntries };
      }),

    clearCloudSelection: () =>
      set({ cloudSelectedEntries: emptyCloudSelection() }),

    importRunbooksFromCloud: async (files) => {
      const filesCount = files.length;
      if (filesCount === 0) {
        return;
      }

      const client = getCloudClient(get().cloudProvider);
      const t = getMessages(get().language);

      if (filesCount > 1) {
        const confirmed = await get().confirm(
          t.dialogs.importCloudFilesMessage(files.map((file) => file.name)),
          {
            title: t.dialogs.importCloudFilesTitle,
            confirmLabel: t.dialogs.importCloudFilesConfirm,
            tone: DialogTone.INFO,
          },
        );

        if (!confirmed) {
          return;
        }
      }

      // Every file is read before the first one is added

      const pending: {
        file: CloudEntry;
        content: RunbookContent;
        revision: string;
      }[] = [];

      const syncs = new Map<string, RunbookSync>(
        files.map((file) => [
          file.id,
          {
            provider: get().cloudProvider,
            filename: file.name,
            folderId: parentFolderId(get(), file),
          },
        ]),
      );

      set({ cloudLoading: true, cloudError: null });
      let failure: string | null = null;

      for (const file of files) {
        let text: string;
        try {
          text = await client.readFile(file);
        } catch (error) {
          console.error("Cloud file read failed", error);
          failure = t.cloudModal.genericError;
          continue;
        }

        try {
          pending.push({
            file,
            content: parseRunbookSource(text),
            revision: sha256(text),
          });
        } catch {
          failure = t.cloudModal.invalidFileError;
        }
      }

      set({ cloudLoading: false, cloudError: failure });

      let added = 0;
      for (const { file, content, revision } of pending) {
        const decrypted = await decryptImportedContent(content, file.name);
        const sync = syncs.get(file.id);
        const linked = sync && { ...sync, revision };

        if (await addCloudRunbook(file.name, decrypted, linked)) {
          added++;
        }
      }

      if (added > 0) {
        set({ cloudImportModalOpen: false });
      }
    },

    renameCloudEntry: async (entry, basename) => {
      const trimmed = basename.trim();
      if (!trimmed) {
        return;
      }

      // Only files carry the .json extension
      const name = entry.isFolder ? trimmed : withJsonExtension(trimmed);
      if (name === entry.name) {
        return;
      }

      const t = getMessages(get().language);
      const taken = siblingEntries(get(), entry).some(
        (other) =>
          other.id !== entry.id &&
          other.name.toLowerCase() === name.toLowerCase(),
      );

      if (taken) {
        set({ cloudError: t.cloudModal.nameTakenError(name) });
        return;
      }

      const client = getCloudClient(get().cloudProvider);
      set({ cloudLoading: true, cloudError: null });
      try {
        await client.renameEntry(entry, name);
      } catch (error) {
        console.error("Cloud entry rename failed", error);
        set({
          cloudLoading: false,
          cloudError: entry.isFolder
            ? t.cloudModal.renameFolderError
            : t.cloudModal.renameError,
        });
        return;
      }

      set({ cloudLoading: false });
      await get().refreshCloudEntries();
    },

    openCloudFileEditor: async (file) => {
      const t = getMessages(get().language);
      const client = getCloudClient(get().cloudProvider);

      set({
        cloudFileEditor: {
          file,
          folderPath: parentFolderPath(get(), file),
          folderId: parentFolderId(get(), file),
          original: "",
          text: "",
          loading: true,
          saving: false,
          error: null,
        },
      });

      const isCurrentEditor = () => get().cloudFileEditor?.file.id === file.id;

      let text: string;
      try {
        text = await client.readFile(file);
      } catch (error) {
        console.error("Cloud file read failed", error);

        if (isCurrentEditor()) {
          set({
            cloudFileEditor: {
              ...get().cloudFileEditor!,
              loading: false,
              error: t.cloudModal.readError,
            },
          });
        }

        return;
      }

      if (isCurrentEditor()) {
        set({
          cloudFileEditor: {
            ...get().cloudFileEditor!,
            original: text,
            text,
            loading: false,
          },
        });
      }
    },

    setCloudFileEditorText: (text) => {
      const editor = get().cloudFileEditor;
      if (!editor) {
        return;
      }

      // Typing clears a stale "invalid JSON" / failed-save message
      set({ cloudFileEditor: { ...editor, text, error: null } });
    },

    saveCloudFileEditor: async () => {
      const editor = get().cloudFileEditor;
      if (!editor || editor.loading || editor.saving) {
        return;
      }

      const t = getMessages(get().language);
      try {
        JSON.parse(editor.text);
      } catch {
        set({
          cloudFileEditor: {
            ...editor,
            error: t.cloudModal.invalidJsonError,
          },
        });

        return;
      }

      const client = getCloudClient(get().cloudProvider);
      set({ cloudFileEditor: { ...editor, saving: true, error: null } });

      try {
        await client.writeFile(
          editor.file.name,
          editor.text,
          MimeType.JSON,
          editor.folderId,
        );
      } catch (error) {
        console.error("Cloud file save failed", error);
        set({
          cloudFileEditor: {
            ...get().cloudFileEditor!,
            saving: false,
            error: t.cloudModal.saveError,
          },
        });

        return;
      }

      set({ cloudFileEditor: null });
      await get().refreshCloudEntries();
    },

    closeCloudFileEditor: async () => {
      const editor = get().cloudFileEditor;
      if (!editor) {
        return;
      }

      const t = getMessages(get().language);
      const dirty = !editor.loading && editor.text !== editor.original;

      if (dirty) {
        const discard = await get().confirm(
          t.dialogs.discardCloudEditMessage(editor.file.name),
          {
            title: t.dialogs.discardCloudEditTitle,
            confirmLabel: t.dialogs.discardCloudEditConfirm,
            tone: DialogTone.WARNING,
          },
        );

        if (!discard) {
          return;
        }
      }

      set({ cloudFileEditor: null });
    },

    duplicateCloudEntries: async (entries) => {
      if (entries.length === 0) {
        return;
      }

      const t = getMessages(get().language);

      if (entries.length > 1) {
        const confirmed = await get().confirm(
          t.dialogs.duplicateCloudEntriesMessage(
            entries.map((entry) => entry.name),
          ),
          {
            title: t.dialogs.duplicateCloudEntriesTitle,
            confirmLabel: t.dialogs.duplicateCloudEntriesConfirm,
            tone: DialogTone.INFO,
          },
        );

        if (!confirmed) {
          return;
        }
      }

      const client = getCloudClient(get().cloudProvider);
      set({ cloudLoading: true, cloudError: null });

      for (const entry of entries) {
        const parentId = parentFolderId(get(), entry);
        const taken = siblingEntries(get(), entry).map((other) => other.name);

        try {
          await copyCloudEntry(
            client,
            entry,
            parentId,
            buildDuplicateName(entry, taken),
          );
        } catch (error) {
          console.error("Cloud entry duplicate failed", error);
          set({
            cloudError: entry.isFolder
              ? t.cloudModal.duplicateFolderError
              : t.cloudModal.duplicateError,
          });

          break;
        }
      }

      set({
        cloudLoading: false,
        cloudSelectedEntries: emptyCloudSelection(),
      });
      await get().refreshCloudEntries();
    },

    downloadCloudEntries: async (entries) => {
      if (entries.length === 0) {
        return;
      }

      const t = getMessages(get().language);
      const single = entries.length === 1 ? entries[0] : null;

      if (!single) {
        const confirmed = await get().confirm(
          t.dialogs.downloadCloudEntriesMessage(
            entries.map((entry) => entry.name),
          ),
          {
            title: t.dialogs.downloadCloudEntriesTitle,
            confirmLabel: t.dialogs.downloadCloudEntriesConfirm,
            tone: DialogTone.INFO,
          },
        );

        if (!confirmed) {
          return;
        }
      }

      const client = getCloudClient(get().cloudProvider);

      set({ cloudLoading: true, cloudError: null });
      try {
        if (!single) {
          const folder = get().cloudPath.at(-1)?.name;
          downloadBlob(
            await buildCloudEntriesZip(client, entries),
            `${folder ?? CloudSyncConfig.APP_FOLDER_NAME}${ZIP_EXTENSION}`,
          );
        } else if (single.isFolder) {
          downloadBlob(
            await buildCloudFolderZip(client, single),
            `${single.name}${ZIP_EXTENSION}`,
          );
        } else {
          const content = await client.readFile(single);
          downloadBlob(
            new Blob([content], { type: MimeType.JSON }),
            single.name,
          );
        }
      } catch (error) {
        console.error("Cloud entry download failed", error);
        set({
          cloudError: !single
            ? t.cloudModal.downloadEntriesError
            : single.isFolder
              ? t.cloudModal.downloadFolderError
              : t.cloudModal.downloadError,
        });
      } finally {
        set({ cloudLoading: false });
      }
    },

    deleteCloudEntries: async (entries) => {
      if (entries.length === 0) {
        return;
      }

      const t = getMessages(get().language);
      const [single] = entries.length === 1 ? entries : [];

      const confirmed = await get().confirm(
        !single
          ? t.dialogs.deleteCloudEntriesMessage(
              entries.map((entry) => entry.name),
            )
          : single.isFolder
            ? t.dialogs.deleteCloudFolderMessage(single.name)
            : t.dialogs.deleteCloudFileMessage(single.name),
        {
          title: !single
            ? t.dialogs.deleteCloudEntriesTitle
            : single.isFolder
              ? t.dialogs.deleteCloudFolderTitle
              : t.dialogs.deleteCloudFileTitle,
          confirmLabel: !single
            ? t.dialogs.deleteCloudEntriesConfirm
            : single.isFolder
              ? t.dialogs.deleteCloudFolderConfirm
              : t.dialogs.deleteCloudFileConfirm,
          tone: DialogTone.DANGER,
        },
      );

      if (!confirmed) {
        return;
      }

      const client = getCloudClient(get().cloudProvider);
      set({ cloudLoading: true, cloudError: null });

      for (const entry of entries) {
        try {
          await client.deleteEntry(entry);
        } catch (error) {
          console.error("Cloud entry delete failed", error);
          set({
            cloudError: entry.isFolder
              ? t.cloudModal.deleteFolderError
              : t.cloudModal.deleteError,
          });

          break;
        }
      }

      set({
        cloudLoading: false,
        cloudSelectedEntries: emptyCloudSelection(),
      });

      await get().refreshCloudEntries();
    },
  };
}
