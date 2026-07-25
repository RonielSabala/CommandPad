import { CloudProvider } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { PROVIDER_ICON } from "../cloudProviders";
import "./CloudBrowser.css";
import { CloudFileRow } from "./CloudFileRow";
import { CloudFolderRow } from "./CloudFolderRow";
import { CloudPathBar } from "./CloudPathBar";

interface CloudBrowserProps {
  showFiles?: boolean;
  allowCreateFolder?: boolean;
}

export function CloudBrowser({
  showFiles = false,
  allowCreateFolder = false,
}: CloudBrowserProps) {
  const t = useTranslation();
  const provider = useStore((state) => state.cloudProvider);
  const signedIn = useStore((state) => state.cloudSignedIn);
  const accountLabel = useStore((state) => state.cloudAccountLabel);
  const entries = useStore((state) => state.cloudEntries);
  const loading = useStore((state) => state.cloudLoading);
  const error = useStore((state) => state.cloudError);

  const signInToCloud = useStore((state) => state.signInToCloud);
  const signOutOfCloud = useStore((state) => state.signOutOfCloud);

  const ProviderIcon = PROVIDER_ICON[provider];
  const signInLabel =
    provider === CloudProvider.SHAREPOINT
      ? t.cloudModal.signInSharePoint
      : t.cloudModal.signInGoogleDrive;

  const visible = showFiles
    ? entries
    : entries.filter((entry) => entry.isFolder);
  const emptyMessage = showFiles
    ? t.cloudModal.emptyFiles
    : t.cloudModal.emptyFolders;

  return (
    <>
      {!signedIn && (
        <button
          className="btn btn-lg btn-primary signin-button"
          onClick={() => void signInToCloud()}
          disabled={loading}
        >
          <ProviderIcon className="icon-md" />
          {signInLabel}
        </button>
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

          <CloudPathBar allowCreateFolder={allowCreateFolder} />

          <div className="cloud-browser-entries modal-scrollable-body">
            {loading && (
              <p className="cloud-browser-empty">{t.cloudModal.loading}</p>
            )}
            {!loading && visible.length === 0 && (
              <p className="cloud-browser-empty">{emptyMessage}</p>
            )}
            {!loading &&
              visible.map((entry) =>
                entry.isFolder ? (
                  <CloudFolderRow key={entry.id} folder={entry} />
                ) : (
                  <CloudFileRow key={entry.id} file={entry} />
                ),
              )}
          </div>
        </>
      )}

      {error && <p className="cloud-browser-error">{error}</p>}
    </>
  );
}
