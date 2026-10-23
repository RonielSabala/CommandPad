import { DEFAULT_TAB_LABEL, RunbookConfig } from "@/common/config";
import { AppMode, DialogTone, MoveDirection } from "@/common/enums";
import type { RunbookContent } from "@/common/types";
import { getMessages } from "@/i18n/messages";
import { adoptOpenVault, holdsSecrets, unlockVault } from "@/services/vault";
import { generateId } from "@/utils/id";
import { displayLabel, getRunbookLabel } from "@/utils/runbook";
import { parseRunbookSource } from "@/utils/runbookSource";
import { buildDuplicateName as nextDuplicateName } from "@/utils/string";

import type { StoreKit } from "@/store/kit";
import type { StoreServices } from "@/store/services";
import type { ImportedVaultResult } from "@/store/services/vault";
import { createTabObject, tabContent, contentFields } from "@/store/tabState";
import type { StoreState } from "@/store/types";

type LibraryActions = Pick<
  StoreState,
  | "loadRunbookFromLibrary"
  | "removeRunbookFromLibrary"
  | "duplicateRunbook"
  | "addRunbookToLibrary"
  | "importRunbooks"
  | "importRunbookFromText"
  | "reorderRunbooks"
  | "setRunbookFocus"
  | "navigateRunbookList"
>;

export function createLibrarySlice(
  kit: StoreKit,
  services: StoreServices,
): LibraryActions {
  const { set, get, persist, contentDb } = kit;
  const {
    forgetSyncState,
    trackCloudChanges,
    flagUnsavedCloudChanges,
    markRunbookSynced,
    refreshVaultStatus,
    setVaultRecord,
    writeRunbookContent,
    encryptStoredRunbook,
    decryptImportedContent,
  } = services;

  return {
    loadRunbookFromLibrary: async (runbookId) => {
      const content = await contentDb.get(runbookId);
      if (!content) {
        return;
      }

      const state = get();
      const existingTab = state.tabs.find((t) => t.runbookId === runbookId);
      if (existingTab) {
        get().switchTab(existingTab.id);
        return;
      }

      const runbook = state.runbookLibrary.find((r) => r.id === runbookId);
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
      persist.saveTabsMeta(get().tabs, get().activeTabId);
      persist.saveRunbookLibrary(get().runbookLibrary, get().activeRunbookId);
    },

    removeRunbookFromLibrary: async (id) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const openTab = state.tabs.find((t) => t.runbookId === id);
      const content = openTab ?? (await contentDb.get(id));
      const isEmpty =
        (content?.blocks.length ?? 0) === 0 &&
        (content?.variables.length ?? 0) === 0;

      const runbook = state.runbookLibrary.find((item) => item.id === id);

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

      const runbookLibrary = state.runbookLibrary.filter(
        (item) => item.id !== id,
      );
      let tabs = state.tabs;
      let activeTabId = state.activeTabId;

      let tabIdx = state.tabs.findIndex((t) => t.runbookId === id);
      if (tabIdx >= 0) {
        tabs = state.tabs.filter((t) => t.runbookId !== id);
        if (tabs.length === 0) {
          activeTabId = null;
        } else if (
          state.activeTabId === state.tabs[tabIdx]?.id ||
          !tabs.find((t) => t.id === activeTabId)
        ) {
          tabIdx = Math.min(tabIdx, tabs.length - 1);
          activeTabId = tabs[tabIdx].id;
        }
      }

      const activeRunbookId =
        tabs.find((t) => t.id === activeTabId)?.runbookId ?? null;

      let focusedRunbookId = state.focusedRunbookId;
      if (focusedRunbookId === id) {
        const removedIdx = state.runbookLibrary.findIndex(
          (item) => item.id === id,
        );

        focusedRunbookId =
          runbookLibrary.length === 0
            ? null
            : runbookLibrary[Math.min(removedIdx, runbookLibrary.length - 1)]
                .id;
      }

      set({
        tabs,
        activeTabId,
        activeRunbookId,
        runbookLibrary,
        focusedRunbookId,
      });
      persist.saveTabsMeta(tabs, activeTabId);
      persist.saveRunbookLibrary(runbookLibrary, activeRunbookId);
    },

    duplicateRunbook: async (id) => {
      const state = get();
      if (state.mode === AppMode.READ) {
        return;
      }

      const sourceIndex = state.runbookLibrary.findIndex(
        (item) => item.id === id,
      );

      if (sourceIndex < 0) {
        return;
      }

      const source = state.runbookLibrary[sourceIndex];
      const openTab = state.tabs.find((t) => t.runbookId === id);
      const stored = openTab ? tabContent(openTab) : await contentDb.get(id);

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

      const library = get().runbookLibrary;
      const takenLabels = new Set(library.map((item) => item.label));
      const takenFilenames = new Set(library.map((item) => item.filename));

      // Base the copy's name on what the row actually shows
      const label = nextDuplicateName(
        displayLabel(source.label, getMessages(get().language)),
        (candidate) => takenLabels.has(candidate),
      );
      const filename = source.filename
        ? nextDuplicateName(source.filename, (candidate) =>
            takenFilenames.has(candidate),
          )
        : "";

      const newId = generateId();
      await writeRunbookContent(newId, copy);

      set((s) => {
        const runbookLibrary = [...s.runbookLibrary];
        const insertAt = runbookLibrary.findIndex((item) => item.id === id) + 1;
        runbookLibrary.splice(insertAt, 0, {
          id: newId,
          label,
          filename,
          secured: holdsSecrets(copy),
        });

        return { runbookLibrary };
      });

      persist.saveRunbookLibrary(get().runbookLibrary, get().activeRunbookId);
    },

    addRunbookToLibrary: async (
      content,
      filename,
      rawFilename,
      sync,
      openInTab = true,
      vault,
    ) => {
      const label = getRunbookLabel(
        content.blocks,
        filename || RunbookConfig.DEFAULT_LABEL,
      );

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

      const state = get();
      const existing = state.runbookLibrary.find(
        (item) => item.label === label || item.filename === filename,
      );

      if (existing) {
        const existingName = existing.label || existing.filename;
        const t = getMessages(get().language);
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
          runbookLibrary: s.runbookLibrary.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  label,
                  filename: filename || "",
                  secured: holdsSecrets(content),
                  // An import keeps the entry's existing link unless it brings its own
                  ...(sync ? { sync } : {}),
                }
              : item,
          ),
          tabs: s.tabs.map((t) =>
            t.runbookId === existing.id
              ? { ...t, ...contentFields(content) }
              : t,
          ),
        }));
        persist.saveRunbookLibrary(get().runbookLibrary, get().activeRunbookId);
        if (existing.id === get().activeRunbookId) {
          persist.saveTabsMeta(get().tabs, get().activeTabId);
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
        runbookLibrary: [
          ...s.runbookLibrary,
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
        persist.saveRunbookLibrary(get().runbookLibrary, get().activeRunbookId);
        return true;
      }

      await get().loadRunbookFromLibrary(newId);
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
              await get().addRunbookToLibrary(
                decrypted.content,
                file.name.replace(/\.json$/i, ""),
                file.name,
                undefined,
                openInTab,
                decrypted.vault
                  ? {
                      record: decrypted.vault,
                      passphrase: decrypted.passphrase,
                    }
                  : undefined,
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

      return await get().addRunbookToLibrary(
        decrypted.content,
        generateId(),
        getMessages(get().language).dialogs.pastedRunbook,
        undefined,
        undefined,
        decrypted.vault
          ? { record: decrypted.vault, passphrase: decrypted.passphrase }
          : undefined,
      );
    },

    reorderRunbooks: (sourceId, targetId) => {
      const items = [...get().runbookLibrary];
      const sourceIndex = items.findIndex((item) => item.id === sourceId);
      const targetIndex = items.findIndex((item) => item.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) {
        return;
      }

      const [removed] = items.splice(sourceIndex, 1);
      items.splice(targetIndex, 0, removed);

      set({ runbookLibrary: items });
      persist.saveRunbookLibrary(items, get().activeRunbookId);
    },

    setRunbookFocus: (id) => set({ focusedRunbookId: id }),

    navigateRunbookList: (direction) => {
      const { runbookLibrary, focusedRunbookId } = get();
      if (runbookLibrary.length === 0) {
        return;
      }

      const count = runbookLibrary.length;
      const currentIndex = runbookLibrary.findIndex(
        (item) => item.id === focusedRunbookId,
      );

      let nextIndex: number;
      if (currentIndex < 0) {
        nextIndex = direction === MoveDirection.DOWN ? 0 : count - 1;
      } else {
        nextIndex =
          direction === MoveDirection.DOWN
            ? (currentIndex + 1) % count
            : (currentIndex - 1 + count) % count;
      }

      const nextId = runbookLibrary[nextIndex].id;
      set({ focusedRunbookId: nextId });
      void get().loadRunbookFromLibrary(nextId);
    },
  };
}
