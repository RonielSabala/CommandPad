import { DEFAULT_TAB_LABEL, RunbookConfig } from "@/common/config";
import { AppMode, DialogTone, MoveDirection } from "@/common/enums";
import type { RunbookContent } from "@/common/types";
import { getMessages } from "@/i18n/messages";
import { adoptOpenVault, holdsSecrets, unlockVault } from "@/services/vault";
import type { StoreKit } from "@/store/kit";
import {
  offerNumberedName,
  uniqueLabelIn,
  withLibraryRunbook,
  withoutRunbooks,
} from "@/store/libraryState";
import { getLibraryRunbook, getTabByRunbookId } from "@/store/selectors";
import type { StoreServices } from "@/store/services";
import {
  importedVault,
  type ImportedVaultResult,
} from "@/store/services/vault";
import {
  autoRunbookLabel,
  contentFields,
  createTabObject,
  labelRunbook,
  libraryRunbookLabel,
  tabContent,
} from "@/store/tabState";
import type { StoreState } from "@/store/types";
import { stripJsonExtension } from "@/utils/export";
import { generateId } from "@/utils/id";
import {
  libraryRunbookDropParent,
  visibleRunbooks,
  withFolderExpanded,
  withLibraryItemMoved,
} from "@/utils/libraryTree";
import { displayLabel, getRunbookLabel } from "@/utils/runbook";
import { parseRunbookSource } from "@/utils/runbookSource";
import { buildDuplicateName as nextDuplicateName } from "@/utils/string";

type LibraryActions = Pick<
  StoreState,
  | "loadLibraryRunbook"
  | "removeLibraryRunbook"
  | "duplicateLibraryRunbook"
  | "renameLibraryRunbook"
  | "resetLibraryRunbookName"
  | "addLibraryRunbook"
  | "importRunbooks"
  | "importRunbookFromText"
  | "moveLibraryRunbook"
  | "setRunbookFocus"
  | "navigateRunbookList"
>;

export function createLibraryRunbooksSlice(
  kit: StoreKit,
  services: StoreServices,
): LibraryActions {
  const { set, get, contentDb, saveTabs, saveLibrary } = kit;
  const {
    forgetSyncState,
    trackCloudChanges,
    flagUnsavedCloudChanges,
    markRunbookSynced,
    refreshVaultStatus,
    setVaultRecord,
    writeRunbookContent,
    readRunbookContent,
    encryptStoredRunbook,
    decryptImportedContent,
  } = services;

  /** Offer `numbered`, since the folder already has `label`. */
  const offerNumberedLabel = (
    label: string,
    numbered: string,
    accept: () => void,
  ) =>
    offerNumberedName(
      get(),
      (t) =>
        t.dialogs.runbookNameTakenMessage(
          displayLabel(label, t),
          displayLabel(numbered, t),
        ),
      accept,
    );

  return {
    loadLibraryRunbook: async (runbookId) => {
      const content = await contentDb.get(runbookId);
      if (!content) {
        return;
      }

      const state = get();
      const existingTab = getTabByRunbookId(state, runbookId);
      if (existingTab) {
        get().switchTab(existingTab.id);
        return;
      }

      const runbook = getLibraryRunbook(state, runbookId);
      const label = runbook?.label ?? DEFAULT_TAB_LABEL;
      const tab = {
        ...createTabObject(label, runbookId),
        ...contentFields(content),
      };

      set((s) => ({
        tabs: [...s.tabs, tab],
        activeTabId: tab.id,
        activeRunbookId: runbookId,
      }));

      trackCloudChanges(runbookId, tabContent(tab));
      saveTabs();
      saveLibrary();
    },

    removeLibraryRunbook: async (id) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const content = await readRunbookContent(id);
      const isEmpty =
        (content?.blocks.length ?? 0) === 0 &&
        (content?.variables.length ?? 0) === 0;

      const runbook = getLibraryRunbook(state, id);

      // A saved runbook still exists in the cloud, so removing it loses nothing
      const sync = runbook?.sync;
      if (!isEmpty && (!sync || sync.pending)) {
        const t = getMessages(get().language);
        const name = displayLabel(runbook?.label ?? "", t);

        const confirmed = await get().confirm(
          sync
            ? t.dialogs.deleteUnsavedRunbookMessage(name)
            : t.dialogs.deleteRunbookMessage(name),
          {
            title: t.dialogs.deleteRunbookTitle,
            confirmLabel: t.dialogs.deleteRunbookConfirm,
            tone: DialogTone.DANGER,
          },
        );

        if (!confirmed) {
          return;
        }
      }

      await contentDb.delete(id);
      forgetSyncState(id);

      set((s) => withoutRunbooks(s, new Set([id])));
      saveTabs();
      saveLibrary();
    },

    duplicateLibraryRunbook: async (id) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const sourceIndex = state.libraryRunbooks.findIndex(
        (runbook) => runbook.id === id,
      );
      if (sourceIndex < 0) {
        return;
      }

      const source = state.libraryRunbooks[sourceIndex];
      const stored = await readRunbookContent(id);
      if (!stored) {
        return;
      }

      const content = contentFields(stored);
      const copy: RunbookContent = {
        variables: content.variables.map((variable) => ({
          ...variable,
          id: generateId(),
        })),
        blocks: content.blocks.map((block) => ({
          ...block,
          id: generateId(),
        })),
        variableSections: content.variableSections.map((section) => ({
          ...section,
          id: generateId(),
        })),
      };

      // The library may have changed while the content loaded
      const current = get();
      const takenFilenames = new Set(
        current.libraryRunbooks.map((r) => r.filename),
      );
      const label = uniqueLabelIn(current, source.folderId, source.label);
      const filename = source.filename
        ? nextDuplicateName(source.filename, (candidate) =>
            takenFilenames.has(candidate),
          )
        : "";

      const newId = generateId();
      await writeRunbookContent(newId, copy);

      set((s) => {
        const libraryRunbooks = [...s.libraryRunbooks];
        const insertAt = libraryRunbooks.findIndex((r) => r.id === id) + 1;
        libraryRunbooks.splice(insertAt, 0, {
          id: newId,
          label,
          filename,
          named: source.named,
          folderId: source.folderId,
          secured: holdsSecrets(copy),
        });

        return { libraryRunbooks };
      });

      saveLibrary();
    },

    renameLibraryRunbook: (id, name) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const label = name.trim().slice(0, RunbookConfig.LABEL_MAX_LENGTH);
      if (!label) {
        return;
      }

      const runbook = getLibraryRunbook(state, id);
      if (!runbook) {
        return;
      }

      const numbered = uniqueLabelIn(state, runbook.folderId, label, id);
      if (numbered !== label) {
        offerNumberedLabel(label, numbered, () =>
          get().renameLibraryRunbook(id, numbered),
        );

        return;
      }

      set((s) => labelRunbook(s, id, label, true));
      saveTabs();
      saveLibrary();
    },

    resetLibraryRunbookName: async (id) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      if (!getLibraryRunbook(state, id)?.named) {
        return;
      }

      const stored = getTabByRunbookId(state, id)
        ? null
        : await contentDb.get(id);

      set((s) => {
        const runbook = getLibraryRunbook(s, id);
        if (!runbook?.named) {
          return s;
        }

        const blocks = getTabByRunbookId(s, id)?.blocks ?? stored?.blocks;
        const label = autoRunbookLabel(s, runbook, blocks);
        return labelRunbook(s, id, label, false);
      });

      saveTabs();
      saveLibrary();
    },

    addLibraryRunbook: async (
      content,
      filename,
      rawFilename,
      sync,
      openInTab = true,
      vault,
    ) => {
      const label = getRunbookLabel(content.blocks, filename);

      /**
       * Content that just came down from the cloud is already in sync;
       * anything else may have landed on top of an existing link.
       */
      const settleSync = (runbookId: string) => {
        if (sync) {
          markRunbookSynced(runbookId, content, sync);
        } else {
          flagUnsavedCloudChanges(runbookId);
        }
      };

      const applyImportedVault = async (runbookId: string) => {
        if (!vault) {
          return;
        }

        setVaultRecord(runbookId, vault.record);

        const opened = vault.passphrase
          ? await unlockVault(runbookId, vault.passphrase, vault.record)
          : adoptOpenVault(runbookId, vault.record);

        if (!opened) {
          return;
        }

        refreshVaultStatus();
        await encryptStoredRunbook(runbookId);
      };

      // An import lands at the top level, so only a name taken there collides
      const state = get();
      const t = getMessages(state.language);
      const shown = displayLabel(label, t);
      const existing = state.libraryRunbooks.find(
        (r) =>
          r.filename === filename ||
          (!r.folderId && displayLabel(r.label, t) === shown),
      );

      if (existing) {
        const existingName = existing.label || existing.filename;
        const confirmed = await get().confirm(
          t.dialogs.overwriteMessage(rawFilename, existingName),
          {
            title: t.dialogs.overwriteTitle,
            confirmLabel: t.dialogs.overwriteConfirm,
            tone: DialogTone.WARNING,
          },
        );

        if (!confirmed) {
          return false;
        }

        await writeRunbookContent(existing.id, content);
        set((s) => ({
          ...withLibraryRunbook(s, existing.id, (runbook) => ({
            ...runbook,
            label: libraryRunbookLabel(
              s,
              { ...runbook, filename },
              content.blocks,
            ),
            filename: filename || "",
            secured: holdsSecrets(content),
            // An import keeps the runbook's existing link unless it brings its own
            ...(sync ? { sync } : {}),
          })),
          tabs: s.tabs.map((t) =>
            t.runbookId === existing.id
              ? { ...t, ...contentFields(content) }
              : t,
          ),
        }));

        saveLibrary();
        if (existing.id === get().activeRunbookId) {
          saveTabs();
        }

        if (!existing.vault) {
          await applyImportedVault(existing.id);
        }

        settleSync(existing.id);
        return true;
      }

      const newId = generateId();
      await writeRunbookContent(newId, content);
      set((s) => ({
        libraryRunbooks: [
          ...s.libraryRunbooks,
          {
            id: newId,
            label,
            filename: filename || "",
            secured: holdsSecrets(content),
            ...(sync ? { sync } : {}),
          },
        ],
      }));
      await applyImportedVault(newId);
      settleSync(newId);

      if (!openInTab) {
        saveLibrary();
        return true;
      }

      await get().loadLibraryRunbook(newId);
      return true;
    },

    importRunbooks: async (files) => {
      let failedCount = 0;
      const openInTab = files.length === 1;

      const readFile = (file: File) =>
        new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = async (loadEvent) => {
            try {
              const decrypted = await decryptImportedContent(
                parseRunbookSource(String(loadEvent.target?.result)),
                file.name,
              );

              await get().addLibraryRunbook(
                decrypted.content,
                stripJsonExtension(file.name),
                file.name,
                undefined,
                openInTab,
                importedVault(decrypted),
              );
            } catch {
              failedCount += 1;
            }

            resolve();
          };

          reader.onerror = () => {
            failedCount += 1;
            resolve();
          };

          reader.readAsText(file);
        });

      for (const file of files) {
        await readFile(file);
      }

      if (failedCount > 0) {
        const t = getMessages(get().language);
        await get().alert(t.dialogs.importFailed(failedCount), {
          title: t.dialogs.importFailedTitle,
          tone: DialogTone.WARNING,
        });
      }
    },

    importRunbookFromText: async (text) => {
      let decrypted: ImportedVaultResult;
      try {
        decrypted = await decryptImportedContent(parseRunbookSource(text));
      } catch {
        return false;
      }

      return await get().addLibraryRunbook(
        decrypted.content,
        generateId(),
        getMessages(get().language).dialogs.pastedRunbook,
        undefined,
        undefined,
        importedVault(decrypted),
      );
    },

    moveLibraryRunbook: (id, targetId, zone) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const runbook = getLibraryRunbook(state, id);
      if (!runbook) {
        return;
      }

      const folderId =
        libraryRunbookDropParent(state.libraryRunbooks, targetId, zone) ??
        undefined;

      const label = uniqueLabelIn(state, folderId, runbook.label, id);
      const relabels = label !== runbook.label;

      const place = () => {
        set((s) => ({
          libraryFolders: withFolderExpanded(s.libraryFolders, folderId),
          ...labelRunbook(
            {
              ...s,
              libraryRunbooks: withLibraryItemMoved(
                s.libraryRunbooks,
                id,
                (r) => (r.folderId === folderId ? r : { ...r, folderId }),
                targetId,
                zone,
              ),
            },
            id,
            label,
            runbook.named === true,
          ),
        }));

        if (relabels) {
          saveTabs();
        }

        saveLibrary();
      };

      if (!relabels) {
        place();
        return;
      }

      offerNumberedLabel(runbook.label, label, place);
    },

    setRunbookFocus: (id) => set({ focusedRunbookId: id }),

    navigateRunbookList: (direction) => {
      const state = get();
      const { focusedRunbookId } = state;

      const visible = visibleRunbooks(
        state.libraryFolders,
        state.libraryRunbooks,
        state.runbookSearchQuery,
      );
      if (visible.length === 0) {
        return;
      }

      const count = visible.length;
      const currentIndex = visible.findIndex((r) => r.id === focusedRunbookId);

      let nextIndex: number;
      if (currentIndex < 0) {
        nextIndex = direction === MoveDirection.DOWN ? 0 : count - 1;
      } else {
        nextIndex =
          direction === MoveDirection.DOWN
            ? (currentIndex + 1) % count
            : (currentIndex - 1 + count) % count;
      }

      const nextId = visible[nextIndex].id;
      set({ focusedRunbookId: nextId });

      void get().loadLibraryRunbook(nextId);
    },
  };
}
