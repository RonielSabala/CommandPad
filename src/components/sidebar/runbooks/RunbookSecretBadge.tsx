import { VaultStatus } from "@/common/enums";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { ShieldCheck, ShieldSlash } from "react-bootstrap-icons";

import "./RunbookSecretBadge.css";

interface Props {
  runbookId: string;
}

export function RunbookSecretBadge({ runbookId }: Props) {
  const t = useTranslation();
  const status = useStore(
    (state) => state.vaultStatus[runbookId] ?? VaultStatus.ABSENT,
  );
  const requestVaultUnlock = useStore((state) => state.requestVaultUnlock);
  const changeVaultPassphrase = useStore(
    (state) => state.changeVaultPassphrase,
  );

  const unprotected =
    status === VaultStatus.ABSENT || status === VaultStatus.UNSUPPORTED;

  return (
    <button
      className={classNames(
        "runbook-badge",
        "runbook-secret",
        `secret-${status}`,
      )}
      {...tooltip(t.runbooks.secretStatus[status])}
      aria-label={t.runbooks.secretStatus[status]}
      disabled={status === VaultStatus.UNSUPPORTED}
      onClick={() => {
        void (status === VaultStatus.UNLOCKED
          ? changeVaultPassphrase(runbookId)
          : requestVaultUnlock(runbookId));
      }}
    >
      {unprotected ? (
        <ShieldSlash className="icon-md" />
      ) : (
        <ShieldCheck className="icon-md" />
      )}
    </button>
  );
}
