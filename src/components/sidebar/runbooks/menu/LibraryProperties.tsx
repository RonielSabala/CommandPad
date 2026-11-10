import { CssClass } from "@/common/constants/css";
import { ButtonType } from "@/common/constants/dom";
import { RunbookSyncStatus, VaultStatus } from "@/common/enums";
import type {
  LibraryRunbook,
  RunbookLinks,
  RunbookStats,
} from "@/common/types";
import { InfoTable } from "@/components/common/info/InfoTable";
import { InfoDismissContext } from "@/components/common/info/infoTooltipContext";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { PROVIDER_NAME } from "@/components/modals/cloud/cloudProviders";
import { useTranslation } from "@/i18n";
import { getLibraryRunbook, isRunbookOpen, useStore } from "@/store/store";
import { getExportBasename, withJsonExtension } from "@/utils/export";
import {
  displayFolderName,
  folderLocation,
  folderSubtree,
} from "@/utils/libraryTree";
import { displayLabel } from "@/utils/runbook";
import { useContext, useEffect, useMemo, useState } from "react";

function useRunbookStats(runbookIds: Iterable<string>) {
  const readRunbookStats = useStore((state) => state.readRunbookStats);
  const [stats, setStats] = useState<RunbookStats | null>(null);

  useEffect(() => {
    let current = true;

    void Promise.all(Array.from(runbookIds, readRunbookStats)).then((all) => {
      if (!current) {
        return;
      }

      const total: RunbookStats = { bytes: 0, blocks: 0, variables: 0 };
      for (const one of all) {
        if (one) {
          total.bytes += one.bytes;
          total.blocks += one.blocks;
          total.variables += one.variables;
        }
      }

      setStats(total);
    });

    return () => {
      current = false;
    };
  }, [runbookIds, readRunbookStats]);

  return stats;
}

function useRunbookLinks(runbookId: string) {
  const readRunbookLinks = useStore((state) => state.readRunbookLinks);
  const libraryRunbooks = useStore((state) => state.libraryRunbooks);
  const [links, setLinks] = useState<RunbookLinks | null>(null);

  useEffect(() => {
    let current = true;

    void readRunbookLinks(runbookId).then((read) => {
      if (current) {
        setLinks(read);
      }
    });

    return () => {
      current = false;
    };
  }, [runbookId, libraryRunbooks, readRunbookLinks]);

  return links;
}

/** Links that open each runbook. */
function RunbookLinkList({
  runbooks,
}: {
  runbooks: readonly LibraryRunbook[];
}) {
  const t = useTranslation();
  const dismiss = useContext(InfoDismissContext);
  const loadLibraryRunbook = useStore((state) => state.loadLibraryRunbook);

  return (
    <div className={CssClass.TOOLTIP_LINKS}>
      {runbooks.map(({ id, label }) => (
        <button
          key={id}
          type={ButtonType.BUTTON}
          className={CssClass.TOOLTIP_LINK}
          onClick={() => {
            dismiss();
            void loadLibraryRunbook(id);
          }}
        >
          {displayLabel(label, t)}
        </button>
      ))}
    </div>
  );
}

export function RunbookProperties({ runbookId }: { runbookId: string }) {
  const t = useTranslation();
  const folders = useStore((state) => state.libraryFolders);
  const runbookIds = useMemo(() => [runbookId], [runbookId]);
  const runbook = useStore((state) => getLibraryRunbook(state, runbookId));

  const format = useInfoFormat();
  const stats = useRunbookStats(runbookIds);
  const links = useRunbookLinks(runbookId);

  const isOpen = useStore((state) => isRunbookOpen(state, runbookId));
  const transientSync = useStore((state) => state.runbookSyncStatus[runbookId]);
  const vaultStatus = useStore(
    (state) => state.vaultStatus[runbookId] ?? VaultStatus.ABSENT,
  );

  if (!runbook) {
    return null;
  }

  const { rows, sections } = t.info;
  const sync = runbook.sync;
  const syncStatus =
    transientSync ??
    (sync?.pending ? RunbookSyncStatus.UNSAVED : RunbookSyncStatus.SYNCED);

  return (
    <InfoTable
      title={t.info.runbookTitle}
      sections={[
        {
          title: sections.overview,
          rows: [
            { label: rows.name, value: displayLabel(runbook.label, t) },
            {
              label: rows.nameSource,
              value: runbook.named ? t.info.manualName : t.info.derivedName,
            },
            {
              label: rows.location,
              value: folderLocation(folders, runbook.folderId ?? null, t),
            },
            {
              label: rows.fileName,
              value: withJsonExtension(
                runbook.filename || getExportBasename(runbook.label),
              ),
            },
            { label: rows.openInTab, value: isOpen ? t.info.yes : t.info.no },
            {
              label: rows.secrets,
              value: runbook.secured ? t.info.vaultState[vaultStatus] : null,
            },
          ],
        },
        {
          title: sections.content,
          rows: [
            { label: rows.blocks, value: stats && format.count(stats.blocks) },
            {
              label: rows.variables,
              value: stats && format.count(stats.variables),
            },
            { label: rows.size, value: stats && format.size(stats.bytes) },
            {
              label: rows.runbookUses,
              value: links?.uses.length ? (
                <RunbookLinkList runbooks={links.uses} />
              ) : null,
            },
            {
              label: rows.runbookUsedBy,
              value: links?.usedBy.length ? (
                <RunbookLinkList runbooks={links.usedBy} />
              ) : null,
            },
          ],
        },
        ...(sync
          ? [
              {
                title: sections.cloud,
                rows: [
                  { label: rows.provider, value: PROVIDER_NAME[sync.provider] },
                  {
                    label: rows.fileName,
                    value: withJsonExtension(sync.filename),
                  },
                  {
                    label: rows.status,
                    value: t.info.syncState[syncStatus],
                    alert: syncStatus === RunbookSyncStatus.ERROR,
                  },
                ],
              },
            ]
          : []),
      ]}
    />
  );
}

export function FolderProperties({ folderId }: { folderId: string | null }) {
  const t = useTranslation();
  const folders = useStore((state) => state.libraryFolders);
  const runbooks = useStore((state) => state.libraryRunbooks);

  const folder = folders.find(({ id }) => id === folderId);
  const subtree = useMemo(
    () => (folderId ? folderSubtree(folders, folderId) : null),
    [folders, folderId],
  );
  const runbookIds = useMemo(() => {
    const ids = new Set<string>();

    for (const { id, folderId: parentId } of runbooks) {
      if (!subtree || (parentId && subtree.has(parentId))) {
        ids.add(id);
      }
    }

    return ids;
  }, [runbooks, subtree]);

  const openInTabsCount = useStore(
    (state) =>
      state.tabs.filter(
        ({ runbookId }) => runbookId && runbookIds.has(runbookId),
      ).length,
  );

  const format = useInfoFormat();
  const stats = useRunbookStats(runbookIds);

  if (folderId && !folder) {
    return null;
  }

  const { rows, sections } = t.info;

  return (
    <InfoTable
      title={t.info.folderTitle}
      sections={[
        {
          title: sections.overview,
          rows: [
            ...(folder
              ? [{ label: rows.name, value: displayFolderName(folder.name, t) }]
              : []),
            {
              label: rows.location,
              value: folderLocation(folders, folder?.parentId ?? null, t),
            },
            {
              label: rows.folders,
              value: format.count(subtree ? subtree.size - 1 : folders.length),
            },
            { label: rows.runbooks, value: format.count(runbookIds.size) },
            { label: rows.openInTabs, value: format.count(openInTabsCount) },
            { label: rows.size, value: stats && format.size(stats.bytes) },
          ],
        },
      ]}
    />
  );
}
