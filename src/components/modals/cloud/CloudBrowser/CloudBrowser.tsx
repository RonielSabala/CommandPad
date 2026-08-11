import { CloudProvider } from "@/common/enums";
import { SearchInput } from "@/components/common/SearchInput";
import { Spinner } from "@/components/common/Spinner";
import { useTranslation } from "@/i18n";
import {
  compareCloudEntries,
  type CloudEntry,
  type CloudFolderRef,
} from "@/services/cloud";
import { useStore } from "@/store/store";
import { classNames, matchesQuery } from "@/utils/string";
import { useCallback, useMemo, useRef, useState, type MouseEvent } from "react";

import { PROVIDER_ICON, PROVIDER_NAME } from "../cloudProviders";
import "./CloudBrowser.css";
import { CloudFileRow } from "./CloudFileRow";
import { CloudFolderRow } from "./CloudFolderRow";
import { CloudListHeader } from "./CloudListHeader";
import { CloudNewFolderRow } from "./CloudNewFolderRow";
import { CloudPathBar } from "./CloudPathBar";
import { CloudSelectionPills } from "./CloudSelectionPills";
import {
  CloudSelectionContext,
  type CloudSelectionApi,
  type CloudSelectionModifiers,
} from "./cloudSelection";

interface CloudBrowserProps {
  showFiles?: boolean;
}

interface CloudRow {
  entry: CloudEntry;
  path?: CloudFolderRef[];
}

export function CloudBrowser({ showFiles = false }: CloudBrowserProps) {
  const t = useTranslation();
  const provider = useStore((state) => state.cloudProvider);
  const signedIn = useStore((state) => state.cloudSignedIn);
  const accountLabel = useStore((state) => state.cloudAccountLabel);
  const entries = useStore((state) => state.cloudEntries);
  const loading = useStore((state) => state.cloudLoading);
  const error = useStore((state) => state.cloudError);

  const searchQuery = useStore((state) => state.cloudSearchQuery);
  const searchEntries = useStore((state) => state.cloudSearchEntries);
  const searchLoading = useStore((state) => state.cloudSearchLoading);
  const setCloudSearchQuery = useStore((state) => state.setCloudSearchQuery);
  const sort = useStore((state) => state.cloudSort);

  const signInToCloud = useStore((state) => state.signInToCloud);
  const signOutOfCloud = useStore((state) => state.signOutOfCloud);
  const createCloudFolder = useStore((state) => state.createCloudFolder);

  const selectedEntries = useStore((state) => state.cloudSelectedEntries);
  const setCloudSelection = useStore((state) => state.setCloudSelection);
  const toggleCloudSelected = useStore((state) => state.toggleCloudSelected);
  const clearCloudSelection = useStore((state) => state.clearCloudSelection);

  // A non-null draft means the new-folder form is open
  const [newFolderDraft, setNewFolderDraft] = useState<string | null>(null);

  const commitNewFolder = () => {
    if (newFolderDraft === null || !newFolderDraft.trim()) {
      return;
    }

    void createCloudFolder(newFolderDraft);
    setNewFolderDraft(null);
  };

  const ProviderIcon = PROVIDER_ICON[provider];
  const signInLabel =
    provider === CloudProvider.SHAREPOINT
      ? t.cloudModal.signInSharePoint
      : t.cloudModal.signInGoogleDrive;

  const searching = searchQuery.trim().length > 0;

  // Searching swaps the open folder's listing for matches across the whole tree
  const rows: CloudRow[] = useMemo(() => {
    const showsEntry = (entry: CloudEntry) => showFiles || entry.isFolder;

    const matched: CloudRow[] = searching
      ? searchEntries.filter(
          (result) =>
            showsEntry(result.entry) &&
            matchesQuery(searchQuery, result.entry.name),
        )
      : entries.filter(showsEntry).map((entry) => ({ entry }));

    return matched.sort((a, b) => compareCloudEntries(a.entry, b.entry, sort));
  }, [searching, searchEntries, searchQuery, entries, showFiles, sort]);

  // The row where a range starts
  const anchorRef = useRef<string | null>(null);

  const entryRows = useMemo(() => rows.map((row) => row.entry), [rows]);

  const select = useCallback(
    (entry: CloudEntry, modifiers: CloudSelectionModifiers) => {
      const ids = entryRows.map((row) => row.id);
      const from = ids.indexOf(anchorRef.current ?? entry.id);
      const to = ids.indexOf(entry.id);

      // Set range
      if (modifiers.shiftKey && from !== -1 && to !== -1) {
        anchorRef.current = ids[from];

        const [start, end] = from <= to ? [from, to] : [to, from];
        setCloudSelection(entryRows.slice(start, end + 1));
        return;
      }

      anchorRef.current = entry.id;
      if (modifiers.ctrlKey || modifiers.metaKey) {
        toggleCloudSelected(entry);
      } else {
        setCloudSelection([entry]);
      }
    },
    [entryRows, setCloudSelection, toggleCloudSelected],
  );

  const toggle = useCallback(
    (entry: CloudEntry) => {
      anchorRef.current = entry.id;
      toggleCloudSelected(entry);
    },
    [toggleCloudSelected],
  );

  const selection: CloudSelectionApi = useMemo(
    () => ({ rows: entryRows, select, toggle }),
    [entryRows, select, toggle],
  );

  const clearOnBackdrop = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      clearCloudSelection();
    }
  };

  const busy = searching ? searchLoading : loading;
  const emptyMessage = searching
    ? showFiles
      ? t.cloudModal.noResultsFiles
      : t.cloudModal.noResultsFolders
    : showFiles
      ? t.cloudModal.emptyFiles
      : t.cloudModal.emptyFolders;

  return (
    <>
      {!signedIn && (
        <div className="signin-prompt">
          <p className="signin-prompt-text">
            {t.cloudModal.signInPrompt(PROVIDER_NAME[provider])}
          </p>

          <button
            className="btn btn-lg btn-primary"
            onClick={() => void signInToCloud()}
            disabled={loading}
          >
            <ProviderIcon className="icon-md" />
            {signInLabel}
          </button>
        </div>
      )}

      {signedIn && (
        <>
          <div className="cloud-browser-account">
            <span>{t.cloudModal.signedInAs(accountLabel ?? "")}</span>
            <button
              className="btn btn-accent"
              onClick={() => void signOutOfCloud()}
            >
              {t.cloudModal.signOut}
            </button>
          </div>

          <CloudPathBar
            creatingFolder={newFolderDraft !== null}
            onStartNewFolder={() => setNewFolderDraft("")}
          />

          <SearchInput
            value={searchQuery}
            placeholder={
              showFiles
                ? t.cloudModal.searchFilesPlaceholder
                : t.cloudModal.searchFoldersPlaceholder
            }
            onChange={setCloudSearchQuery}
            className={classNames(!showFiles && "is-folders-only")}
          />

          <CloudSelectionPills />

          {newFolderDraft !== null && (
            <CloudNewFolderRow
              value={newFolderDraft}
              onChange={setNewFolderDraft}
              onSubmit={commitNewFolder}
              onCancel={() => setNewFolderDraft(null)}
            />
          )}

          <CloudSelectionContext.Provider value={selection}>
            <div className="cloud-browser-list">
              <div
                className={classNames(
                  "cloud-browser-entries modal-scrollable-body",
                  !showFiles && "is-folders-only",
                  busy && "is-busy",
                  selectedEntries.size > 0 && "has-selection",
                )}
                onClick={clearOnBackdrop}
              >
                {rows.length > 0 && <CloudListHeader />}

                {!busy && rows.length === 0 && (
                  <p className="cloud-browser-empty">{emptyMessage}</p>
                )}

                {rows.map(({ entry, path }) =>
                  entry.isFolder ? (
                    <CloudFolderRow key={entry.id} folder={entry} path={path} />
                  ) : (
                    <CloudFileRow key={entry.id} file={entry} path={path} />
                  ),
                )}
              </div>

              {busy && (
                <p className="cloud-browser-status no-user-select">
                  <span className="cloud-browser-status-label">
                    <Spinner />
                    {t.cloudModal.loading}
                  </span>
                </p>
              )}
            </div>
          </CloudSelectionContext.Provider>
        </>
      )}

      {error && <p className="cloud-browser-error">{error}</p>}
    </>
  );
}
