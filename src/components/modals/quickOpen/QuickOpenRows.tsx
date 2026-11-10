import { CssClass } from "@/common/constants/css";
import { AriaRole } from "@/common/constants/dom";
import type { PaletteCommand } from "@/common/enums";
import { Kbd } from "@/components/common/Kbd";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { useTranslation } from "@/i18n";
import { libraryPath, type LibraryRunbookListing } from "@/utils/libraryTree";
import { displayLabel } from "@/utils/runbook";
import { classNames } from "@/utils/string";
import { memo, type ReactNode } from "react";
import { Clock, FileEarmark } from "react-bootstrap-icons";

import { PALETTE_COMMANDS } from "./paletteCommands";

// Interfaces

interface RowProps {
  index: number;
  selected: boolean;
  onActivate: (index: number) => void;
  onHighlight: (index: number) => void;
}

interface OptionProps extends RowProps {
  tip?: string;
  children: ReactNode;
}

interface RunbookRowProps extends RowProps {
  listing: LibraryRunbookListing;
  recent: boolean;
}

interface CommandRowProps extends RowProps {
  command: PaletteCommand;
}

// Rows

function QuickOpenOption({
  index,
  selected,
  onActivate,
  onHighlight,
  tip,
  children,
}: OptionProps) {
  return (
    <li role={AriaRole.OPTION} aria-selected={selected}>
      <button
        className={classNames(
          "quick-open-row",
          selected && CssClass.IS_SELECTED,
          CssClass.NO_USER_SELECT,
        )}
        tabIndex={-1}
        onClick={() => onActivate(index)}
        onPointerMove={() => onHighlight(index)}
        {...tooltip(tip)}
      >
        {children}
      </button>
    </li>
  );
}

export const QuickOpenRunbookRow = memo(function QuickOpenRunbookRow({
  listing: { runbook, path },
  recent,
  ...row
}: RunbookRowProps) {
  const t = useTranslation();
  const label = displayLabel(runbook.label, t);
  const Icon = recent ? Clock : FileEarmark;

  return (
    <QuickOpenOption {...row} tip={libraryPath([...path, label])}>
      <Icon className={CssClass.ICON_MD} />
      <span className="quick-open-row-label">{label}</span>
      <span className="quick-open-row-path">{libraryPath(path)}</span>

      {recent && (
        <span className="quick-open-row-tag">{t.runbooks.recentlyOpened}</span>
      )}
    </QuickOpenOption>
  );
});

export const QuickOpenCommandRow = memo(function QuickOpenCommandRow({
  command,
  ...row
}: CommandRowProps) {
  const t = useTranslation();
  const { binding } = PALETTE_COMMANDS[command];

  return (
    <QuickOpenOption {...row}>
      <span className="quick-open-row-label">
        {t.quickOpen.commands[command]}
      </span>

      {binding && <Kbd binding={binding} />}
    </QuickOpenOption>
  );
});
