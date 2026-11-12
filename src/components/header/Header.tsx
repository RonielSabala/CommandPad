import { CssClass, HEADER_ICON_CLASS } from "@/common/constants/css";
import { AppRoute } from "@/common/constants/routes";
import { AppMode, RunbookView } from "@/common/enums";
import { asButton } from "@/components/common/asButton";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { VerticalDivider } from "@/components/common/VerticalDivider";
import {
  BookIcon,
  ChevronsRightIcon,
  ExportIcon,
  GearIcon,
  PadlockIcon,
  PencilIcon,
} from "@/components/icons";
import { useTranslation } from "@/i18n";
import { getActiveTab, getRunbookView, useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { Link } from "react-router-dom";

import "./Header.css";

export function Header() {
  const t = useTranslation();
  const isRead = useStore((state) => state.mode === AppMode.READ);

  const toggleAppMode = useStore((state) => state.toggleAppMode);
  const openSettingsModal = useStore((state) => state.openSettingsModal);
  const openExportModal = useStore((state) => state.openExportModal);
  const toggleCollapseAll = useStore((state) => state.toggleCollapseAll);

  const isEmpty = useStore(
    (state) => !(getActiveTab(state)?.blocks.length ?? 0),
  );
  const inVariables = useStore(
    (state) => getRunbookView(state) === RunbookView.VARIABLES,
  );
  const hasSections = useStore(
    (state) => !!getActiveTab(state)?.variableSections.length,
  );

  const canCollapse = inVariables ? hasSections : !isEmpty && !isRead;
  const toggleModeLabel = isRead
    ? t.header.switchToEdit
    : t.header.switchToRead;

  return (
    <header className="header-bar">
      <span
        className={classNames("logo", CssClass.NO_USER_SELECT)}
        {...tooltip(t.header.reloadTitle)}
        {...asButton(() => location.reload())}
      >
        <span className="logo-word">Command</span>
        <span className="logo-pad">{"{Pad}"}</span>
      </span>

      <div className="header-spacer" />
      <div className="header-actions">
        <button
          className={classNames(
            CssClass.BTN,
            CssClass.BTN_LG,
            CssClass.BTN_FLAT_ICON,
          )}
          onClick={toggleAppMode}
          aria-label={toggleModeLabel}
          {...tooltip(toggleModeLabel)}
        >
          {isRead ? (
            <PencilIcon className={HEADER_ICON_CLASS} />
          ) : (
            <PadlockIcon className={HEADER_ICON_CLASS} />
          )}
        </button>

        <VerticalDivider />

        <button
          className={classNames(CssClass.BTN, CssClass.BTN_LG)}
          disabled={!canCollapse}
          onClick={toggleCollapseAll}
          {...tooltip(
            inVariables
              ? t.header.toggleSectionsTitle
              : t.header.toggleEditorsTitle,
          )}
        >
          <ChevronsRightIcon className={HEADER_ICON_CLASS} />
          {t.header.collapseAll}
        </button>
      </div>

      <div className="header-spacer" />
      <div className="header-actions">
        <button
          className={classNames(
            CssClass.BTN,
            CssClass.BTN_LG,
            CssClass.BTN_FLAT_ICON,
          )}
          onClick={openSettingsModal}
          aria-label={t.header.openSettings}
          {...tooltip(t.header.openSettings)}
        >
          <GearIcon
            className={classNames(CssClass.ICON, CssClass.ICON_SEMIBOLD)}
          />
        </button>

        <VerticalDivider />

        <Link
          to={AppRoute.DOCS}
          className={classNames(
            CssClass.BTN,
            CssClass.BTN_LG,
            CssClass.BTN_FLAT_ICON,
          )}
          aria-label={t.docs.meta.openDocs}
          {...tooltip(t.docs.meta.openDocs)}
        >
          <BookIcon className={HEADER_ICON_CLASS} />
        </Link>

        <VerticalDivider />

        <button
          className={classNames(
            CssClass.BTN,
            CssClass.BTN_LG,
            CssClass.BTN_PRIMARY,
          )}
          disabled={isEmpty}
          onClick={openExportModal}
          {...tooltip(t.header.exportTitle)}
        >
          <ExportIcon className={HEADER_ICON_CLASS} />
          {t.header.export}
        </button>
      </div>
    </header>
  );
}
