import { LibraryFolderConfig } from "@/common/config";
import { AppMode, DialogTone } from "@/common/enums";
import type { LibraryFolder } from "@/common/types";
import { getMessages } from "@/i18n/messages";
import { generateId } from "@/utils/id";
import {
  displayFolderName,
  folderSubtree,
  libraryFolderDropParent,
  uniqueFolderName,
  withFolderExpanded,
  withLibraryItemMoved,
  withLibraryLevelSorted,
  withSubtreeToggled,
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
  | "toggleLibrarySubtree"
  | "moveLibraryFolder"
  | "removeLibraryFolder"
  | "duplicateLibraryFolder"
  | "sortLibraryFolder"
  | "consumeLibraryFolderRename"
>;

export function createLibraryFoldersSlice(
  kit: StoreKit,
  services: StoreServices,
): LibraryFoldersActions {
  const { set, get, contentDb, saveTabs, saveLibrary } = kit;
  const { forgetSyncState, readRunbookContent, writeRunbookCopy } = services;

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
          LibraryFolderConfig.DEFAULT_NAME,
          getMessages(state.language),
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
          t.dialogs.deleteFolderMessage(displayFolderName(folder.name, t)),
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

      set((s) => {
        const remaining = withoutRunbooks(s, runbookIds);

        return {
          ...remaining,
          libraryFolders: remaining.libraryFolders.filter(
            (f) => !folderIds.has(f.id),
          ),
        };
      });

      saveTabs();
      saveLibrary();
    },

    duplicateLibraryFolder: async (id) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const sourceFolderIds = folderSubtree(state.libraryFolders, id);
      const sources = state.libraryRunbooks.filter(
        (r) => r.folderId !== undefined && sourceFolderIds.has(r.folderId),
      );
      const stored = await Promise.all(
        sources.map((r) => readRunbookContent(r.id)),
      );

      // The library may have changed while the contents loaded
      const current = get();
      if (!current.libraryFolders.some((f) => f.id === id)) {
        return;
      }

      const subtree = folderSubtree(current.libraryFolders, id);
      const copiedIds = new Map([...subtree].map((fid) => [fid, generateId()]));

      // The copy's own parent lies outside the subtree, so it stays put
      const copyOf = (folderId: string) => copiedIds.get(folderId) ?? folderId;

      const folderCopies = current.libraryFolders
        .filter((f) => subtree.has(f.id))
        .map((f) => ({
          ...f,
          id: copyOf(f.id),
          parentId: f.parentId && copyOf(f.parentId),
          name:
            f.id === id
              ? uniqueFolderName(
                  current.libraryFolders,
                  f.parentId,
                  f.name,
                  getMessages(current.language),
                )
              : f.name,
        }));

      // Only runbooks still inside the subtree, and read before, are copied
      const storedById = new Map(sources.map((r, i) => [r.id, stored[i]]));
      const takenFilenames = new Set(
        current.libraryRunbooks.map((r) => r.filename),
      );

      const runbookCopies = await Promise.all(
        current.libraryRunbooks.flatMap((runbook) => {
          const { folderId } = runbook;
          const content = storedById.get(runbook.id);
          if (!content || !folderId || !subtree.has(folderId)) {
            return [];
          }

          return [
            writeRunbookCopy(
              runbook,
              content,
              { label: runbook.label, folderId: copyOf(folderId) },
              takenFilenames,
            ),
          ];
        }),
      );

      set((s) => {
        const libraryFolders = [...s.libraryFolders];
        const insertAt = libraryFolders.findIndex((f) => f.id === id) + 1;
        libraryFolders.splice(insertAt, 0, ...folderCopies);

        return {
          libraryFolders,
          libraryRunbooks: [...s.libraryRunbooks, ...runbookCopies],
        };
      });

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
      const t = getMessages(state.language);

      // Keeping the shown default name keeps it localized
      if (!folder || trimmed === displayFolderName(folder.name, t)) {
        return;
      }

      const numbered = uniqueFolderName(
        state.libraryFolders,
        folder.parentId,
        trimmed,
        t,
        id,
      );

      if (numbered !== trimmed) {
        offerNumberedName(
          state,
          (messages) =>
            messages.dialogs.folderNameTakenMessage(trimmed, numbered),
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

    toggleLibrarySubtree: (id) => {
      set((s) => ({
        libraryFolders: withSubtreeToggled(s.libraryFolders, id),
      }));

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

      const t = getMessages(state.language);

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
        t,
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
        (messages) =>
          messages.dialogs.folderNameTakenMessage(
            displayFolderName(folder.name, messages),
            displayFolderName(name, messages),
          ),
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
