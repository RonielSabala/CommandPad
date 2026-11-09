import { RunbookBlockConfig } from "@/common/config";
import type { CloudProvider } from "@/common/enums";
import type { CloudRunbookRef, LibraryRunbook } from "@/common/types";
import { useLanguage, useTranslation } from "@/i18n";
import type { ChoiceSource } from "@/monaco/completions";
import type { CloudEntry } from "@/services/cloud";
import { getActiveRunbookId, useStore, useStoreApi } from "@/store/store";
import { cloudPathSegments } from "@/utils/embeddedRunbook";
import { folderChoices, folderPath } from "@/utils/folderChoices";
import { formatFileSize } from "@/utils/format";
import {
  displayFolderName,
  libraryLevel,
  libraryPathTrail,
} from "@/utils/libraryTree";
import { displayLabel } from "@/utils/runbook";
import { useMemo } from "react";

/** The library folder typed so far, one level at a time. */
export function useLibraryChoices(
  onPick: (runbook: LibraryRunbook) => void,
): ChoiceSource {
  const t = useTranslation();
  const language = useLanguage();
  const store = useStoreApi();

  return useMemo(() => {
    const describeRunbook = async (runbookId: string) => {
      const stats = await store.getState().readRunbookStats(runbookId);
      return stats
        ? t.runbookBlock.choiceStats(
            formatFileSize(stats.bytes, language),
            stats.blocks,
            stats.variables,
          )
        : undefined;
    };

    // Read as it's asked
    return async (text) => {
      const state = store.getState();
      const folders = state.libraryFolders;
      const hostRunbookId = getActiveRunbookId(state);
      const embeddable = state.libraryRunbooks.filter(
        ({ id, label }) => id !== hostRunbookId && label.trim(),
      );

      const describeFolder = (folderId: string) => {
        const inside = libraryLevel(folders, embeddable, folderId);

        return t.cloudModal.folderItemCount(
          inside.folders.length + inside.runbooks.length,
        );
      };

      const trail = libraryPathTrail(folders, text, t);
      const names = trail.map((folder) => displayFolderName(folder.name, t));
      const level = libraryLevel(folders, embeddable, trail.at(-1)?.id ?? null);

      return folderChoices(
        folderPath(names),
        names,
        [
          ...level.folders.map((folder) => ({
            name: displayFolderName(folder.name, t),
            describe: () => describeFolder(folder.id),
            folder: true,
          })),
          ...level.runbooks.map((runbook) => ({
            name: runbook.label,
            label: displayLabel(runbook.label, t),
            describe: () => describeRunbook(runbook.id),
            onPick: () => onPick(runbook),
          })),
        ],
        t.runbookBlock.parentFolder,
      );
    };
  }, [store, onPick, language, t]);
}

/** The cloud folder typed so far, one level at a time. */
export function useCloudChoices(
  provider: CloudProvider | null,
  onPick: (file: CloudRunbookRef) => void,
): ChoiceSource {
  const t = useTranslation();
  const language = useLanguage();
  const listEmbeddableCloudFolder = useStore(
    (state) => state.listEmbeddableCloudFolder,
  );

  return useMemo(() => {
    const describe = (entry: CloudEntry) =>
      entry.isFolder
        ? entry.itemCount === null
          ? undefined
          : t.cloudModal.folderItemCount(entry.itemCount)
        : entry.size === null
          ? undefined
          : formatFileSize(entry.size, language);

    return async (text) => {
      if (!provider) {
        return [];
      }

      const separator = RunbookBlockConfig.PATH_SEPARATOR;
      const folder = text.slice(0, text.lastIndexOf(separator) + 1);
      const entries = await listEmbeddableCloudFolder(provider, folder);

      if (!entries) {
        return [];
      }

      return folderChoices(
        folder,
        cloudPathSegments(folder),
        entries.map((entry) => ({
          name: entry.name,
          describe: () => describe(entry),
          folder: entry.isFolder,
          onPick: () => onPick({ provider, path: folder + entry.name }),
        })),
        t.runbookBlock.parentFolder,
      );
    };
  }, [provider, listEmbeddableCloudFolder, onPick, language, t]);
}
