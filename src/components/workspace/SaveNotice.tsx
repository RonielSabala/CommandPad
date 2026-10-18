import { SAVE_NOTICE_TIMEOUT_MS } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { AriaRole, ButtonType } from "@/common/constants/dom";
import { SaveOutcome } from "@/common/enums";
import { Spinner } from "@/components/common/Spinner";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { XIcon } from "@/components/icons";
import { PROVIDER_NAME } from "@/components/modals/cloud/cloudProviders";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useEffect, useState, type ComponentType } from "react";
import {
  CheckCircleFill,
  CloudSlashFill,
  ExclamationTriangleFill,
} from "react-bootstrap-icons";

import "./SaveNotice.css";

const OUTCOME_ICON: Record<
  SaveOutcome,
  ComponentType<{ className?: string }>
> = {
  [SaveOutcome.LOCAL]: CheckCircleFill,
  [SaveOutcome.SAVING]: Spinner,
  [SaveOutcome.SAVED]: CheckCircleFill,
  [SaveOutcome.UP_TO_DATE]: CheckCircleFill,
  [SaveOutcome.UPDATED]: CheckCircleFill,
  [SaveOutcome.SIGNED_OUT]: CloudSlashFill,
  [SaveOutcome.FAILED]: ExclamationTriangleFill,
};

const WARNING_OUTCOMES: ReadonlySet<SaveOutcome> = new Set([
  SaveOutcome.SIGNED_OUT,
  SaveOutcome.FAILED,
]);

export function SaveNotice() {
  const t = useTranslation();
  const notice = useStore((state) => state.saveNotice);
  const dismiss = useStore((state) => state.dismissSaveNotice);

  const [shown, setShown] = useState(notice);
  const [closedByHand, setClosedByHand] = useState(false);
  if (notice && notice !== shown) {
    setShown(notice);
    setClosedByHand(false);
  }

  useEffect(() => {
    if (!notice || notice.outcome === SaveOutcome.SAVING) {
      return;
    }

    const timer = window.setTimeout(
      () => dismiss(notice.id),
      SAVE_NOTICE_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [notice, dismiss]);

  const Icon = shown && OUTCOME_ICON[shown.outcome];
  const saving = shown?.outcome === SaveOutcome.SAVING;

  return (
    <div
      className={classNames(
        "save-notice",
        saving && "is-saving",
        notice && "is-visible",
        closedByHand && "is-instant",
        shown && WARNING_OUTCOMES.has(shown.outcome) && "is-warning",
      )}
      role={AriaRole.STATUS}
      aria-live="polite"
    >
      {shown && Icon && (
        <>
          <Icon className={classNames("save-notice-icon", CssClass.ICON)} />
          <span className="save-notice-text">
            {t.runbooks.saveNotice[shown.outcome](
              shown.provider ? PROVIDER_NAME[shown.provider] : "",
            )}
          </span>

          {!saving && (
            <button
              type={ButtonType.BUTTON}
              className="save-notice-close"
              {...tooltip(t.common.close)}
              aria-label={t.common.close}
              tabIndex={notice ? undefined : -1}
              onClick={() => {
                setClosedByHand(true);
                dismiss(shown.id);
              }}
            >
              <XIcon
                className={classNames(CssClass.ICON_SM, CssClass.ICON_BOLD)}
              />
            </button>
          )}

          {saving && (
            <span className="save-notice-progress" aria-hidden={true} />
          )}
        </>
      )}
    </div>
  );
}
