import { LibraryFolderConfig } from "@/common/config";
import { AppMode, DialogTone } from "@/common/enums";
import type { LibraryFolder } from "@/common/types";
import { getMessages } from "@/i18n/messages";
import { generateId } from "@/utils/id";
import {
  folderSubtree,
  libraryFolderDropParent,
  uniqueFolderName,
  withFolderExpanded,
  withLibraryItemMoved,
  withLibraryLevelSorted,
} from "@/utils/libraryTree";

import type { StoreKit } from "@/store/kit";
import {
  offerNumberedName,
  withLibraryFolder,
  withoutRunbooks,
} from "@/store/libraryState";
import type { StoreServices } from "@/store/services";
import type { StoreState } from "@/store/types";

type LibraryFoldersActions = Pick<
  StoreState,
  | "createLibraryFolder"
  | "renameLibraryFolder"
  | "toggleLibraryFolder"
  | "moveLibraryFolder"
  | "removeLibraryFolder"
  | "sortLibraryFolder"
  | "consumeLibraryFolderRename"
>;

export function createLibraryFoldersSlice(
  kit: StoreKit,
  services: StoreServices,
): LibraryFoldersActions {
  const { set, get, contentDb, saveTabs, saveLibrary } = kit;
  const { forgetSyncState } = services;

  return {
    createLibraryFolder: (parentId) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const folder: LibraryFolder = {
        id: generateId(),
        name: uniqueFolderName(
          state.libraryFolders,
          parentId,
          getMessages(state.language).runbooks.folderName,
        ),
        parentId,
      };

      set((s) => ({
        libraryFolders: [
          ...withFolderExpanded(s.libraryFolders, parentId),
          folder,
        ],
        pendingLibraryFolderRenameId: folder.id,
        runbookSearchQuery: "",
      }));

      saveLibrary();
    },

    removeLibraryFolder: async (id) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const folder = state.libraryFolders.find((f) => f.id === id);
      if (!folder) {
        return;
      }

      const folderIds = folderSubtree(state.libraryFolders, id);
      const runbookIds = new Set(
        state.libraryRunbooks
          .filter((r) => r.folderId !== undefined && folderIds.has(r.folderId))
          .map((r) => r.id),
      );

      if (folderIds.size > 1 || runbookIds.size > 0) {
        const t = getMessages(state.language);
        const confirmed = await get().confirm(
          t.dialogs.deleteFolderMessage(folder.name),
          {
            title: t.dialogs.deleteFolderTitle,
            confirmLabel: t.dialogs.deleteFolderConfirm,
            tone: DialogTone.DANGER,
          },
        );

        if (!confirmed) {
          return;
        }
      }

      await Promise.all([...runbookIds].map((rid) => contentDb.delete(rid)));
      runbookIds.forEach(forgetSyncState);

      set((s) => ({
        libraryFolders: s.libraryFolders.filter((f) => !folderIds.has(f.id)),
        ...withoutRunbooks(s, runbookIds),
      }));

      saveTabs();
      saveLibrary();
    },

    renameLibraryFolder: (id, name) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const trimmed = name.trim().slice(0, LibraryFolderConfig.NAME_MAX_LENGTH);
      if (!trimmed) {
        return;
      }

      const folder = state.libraryFolders.find((f) => f.id === id);
      if (!folder) {
        return;
      }

      const numbered = uniqueFolderName(
        state.libraryFolders,
        folder.parentId,
        trimmed,
        id,
      );

      if (numbered !== trimmed) {
        offerNumberedName(
          state,
          (t) => t.dialogs.folderNameTakenMessage(trimmed, numbered),
          () => get().renameLibraryFolder(id, numbered),
        );

        return;
      }

      set((s) => withLibraryFolder(s, id, (f) => ({ ...f, name: trimmed })));
      saveLibrary();
    },

    toggleLibraryFolder: (id) => {
      set((s) =>
        withLibraryFolder(s, id, (f) => ({ ...f, collapsed: !f.collapsed })),
      );

      saveLibrary();
    },

    moveLibraryFolder: (id, targetId, zone) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const folder = state.libraryFolders.find((f) => f.id === id);
      if (!folder) {
        return;
      }

      const parentId = libraryFolderDropParent(
        state.libraryFolders,
        targetId,
        zone,
      );

      // A folder can't end up inside itself
      if (
        parentId !== null &&
        folderSubtree(state.libraryFolders, id).has(parentId)
      ) {
        return;
      }

      const name = uniqueFolderName(
        state.libraryFolders,
        parentId,
        folder.name,
        id,
      );

      const place = () => {
        set((s) => ({
          libraryFolders: withLibraryItemMoved(
            withFolderExpanded(s.libraryFolders, parentId),
            id,
            (f) => (f.parentId === parentId ? f : { ...f, parentId, name }),
            targetId,
            zone,
          ),
        }));

        saveLibrary();
      };

      if (name === folder.name) {
        place();
        return;
      }

      offerNumberedName(
        state,
        (t) => t.dialogs.folderNameTakenMessage(folder.name, name),
        place,
      );
    },

    sortLibraryFolder: (id, direction) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const { folders, runbooks } = withLibraryLevelSorted(
        state.libraryFolders,
        state.libraryRunbooks,
        id,
        direction,
        getMessages(state.language),
      );

      set({ libraryFolders: folders, libraryRunbooks: runbooks });
      saveLibrary();
    },

    consumeLibraryFolderRename: () =>
      set({ pendingLibraryFolderRenameId: null }),
  };
}
