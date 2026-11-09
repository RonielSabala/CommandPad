import { CssClass } from "@/common/constants/css";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import {
  ContextMenuAlign,
  ContextMenuItem,
} from "@/components/common/contextMenu/ContextMenu";
import { tooltip } from "@/components/common/tooltip/tooltip";
import {
  ClipIcon,
  ImportIcon,
  SidebarSectionChevronIcon,
} from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { FileEarmarkZip } from "react-bootstrap-icons";

import "./LibraryImportButton.css";

const HALF_CLASS = classNames(CssClass.BTN, CssClass.BTN_PRIMARY);

export function LibraryImportButton() {
  const t = useTranslation();
  const beginImport = useStore((state) => state.beginImport);
  const beginZipImport = useStore((state) => state.beginZipImport);
  const openPasteRunbookModal = useStore(
    (state) => state.openPasteRunbookModal,
  );

  return (
    <div className="library-import-btn">
      <button
        className={classNames("library-import-main", HALF_CLASS)}
        onClick={beginImport}
        {...tooltip(t.runbooks.importTitle)}
      >
        <ImportIcon
          className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
        />
        <span className="library-import-label">
          <span>{t.runbooks.import}</span>
        </span>
      </button>

      <ActionsMenu
        className="library-import-more"
        triggerClassName={classNames("library-import-chevron", HALF_CLASS)}
        title={t.runbooks.importOptions}
        align={ContextMenuAlign.END}
        icon={
          <SidebarSectionChevronIcon
            className={classNames(CssClass.ICON_SM, CssClass.ICON_BOLD)}
          />
        }
      >
        <ContextMenuItem
          icon={<FileEarmarkZip className={CssClass.ICON_MD} />}
          onSelect={beginZipImport}
        >
          {t.runbooks.importZip}
        </ContextMenuItem>

        <ContextMenuItem
          icon={
            <ClipIcon
              className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
            />
          }
          onSelect={openPasteRunbookModal}
        >
          {t.runbooks.pasteTitle}
        </ContextMenuItem>
      </ActionsMenu>
    </div>
  );
}
