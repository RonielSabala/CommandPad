import { RunbookSyncStatus } from "@/common/enums";
import type { RunbookSync } from "@/common/types";
import { Spinner } from "@/components/common/Spinner";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { PROVIDER_NAME } from "@/components/modals/cloud/cloudProviders";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { ArrowRepeat, CloudCheck, CloudSlash } from "react-bootstrap-icons";

import "./RunbookSyncBadge.css";

interface Props {
  runbookId: string;
  sync: RunbookSync;
}

export function RunbookSyncBadge({ runbookId, sync }: Props) {
  const t = useTranslation();
  const syncStatus = useStore(
    (state) => state.runbookSyncStatus[runbookId] ?? RunbookSyncStatus.SYNCED,
  );
  const syncRunbookNow = useStore((state) => state.syncRunbookNow);
  const statusLabel = t.runbooks.syncStatus[syncStatus](
    PROVIDER_NAME[sync.provider],
  );

  return (
    <button
      className={classNames(
        "runbook-badge",
        "runbook-sync",
        `sync-${syncStatus}`,
      )}
      aria-label={statusLabel}
      {...tooltip(statusLabel)}
      onClick={() => void syncRunbookNow(runbookId)}
    >
      {syncStatus === RunbookSyncStatus.SIGNED_OUT ? (
        <CloudSlash className="icon-md" />
      ) : syncStatus === RunbookSyncStatus.SYNCED ? (
        <CloudCheck className="icon-md" />
      ) : syncStatus === RunbookSyncStatus.SYNCING ? (
        <Spinner />
      ) : (
        <ArrowRepeat className="icon-md" />
      )}
    </button>
  );
}
