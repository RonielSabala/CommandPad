import { CssClass } from "@/common/constants/css";
import { RunbookSyncStatus } from "@/common/enums";
import { formatBinding, KeyBinding, KEYBINDINGS } from "@/common/keybindings";
import type { RunbookSync } from "@/common/types";
import { Spinner } from "@/components/common/Spinner";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { PROVIDER_NAME } from "@/components/modals/cloud/cloudProviders";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import {
  ArrowRepeat,
  CloudArrowUp,
  CloudCheck,
  CloudSlash,
} from "react-bootstrap-icons";

import "./RunbookSyncBadge.css";

const SAVE_SHORTCUT = formatBinding(
  KEYBINDINGS[KeyBinding.SAVE_RUNBOOK].binding,
);

interface Props {
  runbookId: string;
  sync: RunbookSync;
}

export function RunbookSyncBadge({ runbookId, sync }: Props) {
  const t = useTranslation();
  const transientStatus = useStore(
    (state) => state.runbookSyncStatus[runbookId],
  );
  const saveRunbookToCloud = useStore((state) => state.saveRunbookToCloud);
  const syncStatus =
    transientStatus ??
    (sync.pending ? RunbookSyncStatus.UNSAVED : RunbookSyncStatus.SYNCED);
  const statusLabel = t.runbooks.syncStatus[syncStatus](
    PROVIDER_NAME[sync.provider],
    SAVE_SHORTCUT,
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
      onClick={() => void saveRunbookToCloud(runbookId)}
    >
      {syncStatus === RunbookSyncStatus.SIGNED_OUT ? (
        <CloudSlash className={CssClass.ICON_MD} />
      ) : syncStatus === RunbookSyncStatus.SYNCED ? (
        <CloudCheck className={CssClass.ICON_MD} />
      ) : syncStatus === RunbookSyncStatus.UNSAVED ? (
        <CloudArrowUp className={CssClass.ICON_MD} />
      ) : syncStatus === RunbookSyncStatus.SYNCING ? (
        <Spinner />
      ) : (
        <ArrowRepeat className={CssClass.ICON_MD} />
      )}
    </button>
  );
}
