import { CloudProvider } from "@/common/enums";
import { SearchInput } from "@/components/common/SearchInput";
import { useTranslation } from "@/i18n";
import {
  compareCloudEntries,
  type CloudEntry,
  type CloudFolderRef,
} from "@/services/cloud";
import { useStore } from "@/store/store";
import { classNames, matchesQuery } from "@/utils/string";
import { useMemo, useState } from "react";
import { PROVIDER_ICON, PROVIDER_NAME } from "../cloudProviders";
import "./CloudBrowser.css";
import { CloudFileRow } from "./CloudFileRow";
import { CloudFolderRow } from "./CloudFolderRow";
import { CloudListHeader } from "./CloudListHeader";
import { CloudNewFolderRow } from "./CloudNewFolderRow";
import { CloudPathBar } from "./CloudPathBar";

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
              className="btn btn-danger"
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

          {newFolderDraft !== null && (
            <CloudNewFolderRow
              value={newFolderDraft}
              onChange={setNewFolderDraft}
              onSubmit={commitNewFolder}
              onCancel={() => setNewFolderDraft(null)}
            />
          )}

          <div
            className={classNames(
              "cloud-browser-entries modal-scrollable-body",
              !showFiles && "is-folders-only",
            )}
          >
            {rows.length > 0 && <CloudListHeader />}

            {rows.length === 0 && (
              <p className="cloud-browser-empty">
                {busy ? t.cloudModal.loading : emptyMessage}
              </p>
            )}

            {rows.map(({ entry, path }) =>
              entry.isFolder ? (
                <CloudFolderRow key={entry.id} folder={entry} path={path} />
              ) : (
                <CloudFileRow key={entry.id} file={entry} path={path} />
              ),
            )}
          </div>
        </>
      )}

      {error && <p className="cloud-browser-error">{error}</p>}
    </>
  );
}
