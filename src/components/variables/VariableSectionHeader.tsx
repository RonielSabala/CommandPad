import { CssClass } from "@/common/constants/css";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { SidebarSectionChevronIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import type { MouseEventHandler, ReactNode, Ref } from "react";

import "./VariableSectionItem.css";

interface Props {
  children: ReactNode;
  collapsed: boolean;
  count: number;
  onToggle: () => void;
  className?: string;
  ref?: Ref<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function VariableSectionHeader({
  children,
  collapsed,
  count,
  onToggle,
  className,
  ref,
  onClick,
}: Props) {
  const t = useTranslation();
  const foldable = count > 0;
  const toggleLabel = collapsed
    ? t.variables.expandSection
    : t.variables.collapseSection;

  return (
    <div
      ref={ref}
      className={classNames("variable-section-header", className)}
      onClick={onClick}
    >
      {foldable && (
        <button
          className={classNames(
            "btn btn-flat-icon variable-section-toggle",
            CssClass.SELECT_KEY_INERT,
          )}
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={toggleLabel}
          {...tooltip(toggleLabel)}
        >
          <SidebarSectionChevronIcon className="variable-section-chevron icon-md icon-bold" />
        </button>
      )}

      {children}

      {foldable && (
        <button
          className={classNames(
            "variable-section-count no-user-select",
            CssClass.SELECT_KEY_INERT,
          )}
          onClick={onToggle}
          tabIndex={-1}
        >
          {t.variables.sectionCount(count)}
        </button>
      )}
    </div>
  );
}
