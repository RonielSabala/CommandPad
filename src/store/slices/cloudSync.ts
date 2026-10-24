import { AppMode, SaveOutcome } from "@/common/enums";
import type { RunbookContent } from "@/common/types";
import { getMessages } from "@/i18n/messages";
import { parseRunbookSource } from "@/utils/runbookSource";

import type { StoreKit } from "@/store/kit";
import { withLibraryEntry } from "@/store/libraryState";
import { getActiveTab } from "@/store/selectors";
import type { StoreServices } from "@/store/services";
import type { StoreState } from "@/store/types";

type CloudSyncActions = Pick<
  StoreState,
  | "saveActiveRunbook"
  | "saveRunbookToCloud"
  | "resolveCloudConflict"
  | "dismissSaveNotice"
  | "unlinkRunbookSync"
>;

export function createCloudSyncSlice(
  kit: StoreKit,
  services: StoreServices,
): CloudSyncActions {
  const { set, get, saveLibrary } = kit;
  const {
    forgetSyncState,
    getSyncLink,
    setEmbeddedRunbook,
    invalidateEmbed,
    showSaveNotice,
    saveLinkedRunbook,
  } = services;

  return {
    saveActiveRunbook: async () => {
      get().saveState();

      const runbookId = getActiveTab(get())?.runbookId;
      const link = runbookId && getSyncLink(runbookId);
      if (link) {
        await saveLinkedRunbook(runbookId, link);
      } else {
        showSaveNotice(SaveOutcome.LOCAL, null);
      }
    },

    saveRunbookToCloud: async (id) => {
      const link = getSyncLink(id);
      if (link) {
        await saveLinkedRunbook(id, link);
      }
    },

    resolveCloudConflict: (text) => {
      const conflict = get().cloudConflict;
      if (!conflict) {
        return;
      }

      let kept: RunbookContent | null = null;
      if (text !== null) {
        try {
          kept = parseRunbookSource(text, conflict.local);
        } catch {
          const t = getMessages(get().language);
          set({
            cloudConflict: {
              ...conflict,
              error: t.cloudConflict.invalidError,
            },
          });

          return;
        }
      }

      set({ cloudConflict: null });
      conflict.resolve(kept);
    },

    dismissSaveNotice: (id) => {
      if (get().saveNotice?.id === id) {
        set({ saveNotice: null });
      }
    },

    unlinkRunbookSync: (id) => {
      if (get().mode === AppMode.READ) {
        return;
      }

      set((s) =>
        withLibraryEntry(s, id, (item) => ({ ...item, sync: undefined })),
      );

      // Unlink the embed runbook blocks that read this runbook
      for (const [key, entry] of Object.entries(get().embeddedRunbooks)) {
        if (entry.runbookId === id) {
          setEmbeddedRunbook(key, { ...entry, runbookId: undefined });
          invalidateEmbed(key);
        }
      }

      forgetSyncState(id);
      saveLibrary();
    },
  };
}
