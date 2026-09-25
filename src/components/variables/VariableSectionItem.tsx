import { CssClass } from "@/common/constants/css";
import { AppMode, VariableEntryKind } from "@/common/enums";
import type { VariableSection } from "@/common/types";
import { NoteEditor } from "@/components/blocks/note/NoteEditor";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { SidebarSectionChevronIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { memo, useCallback, useRef, type MouseEvent } from "react";

import { VariableRowFrame } from "./VariableRowFrame";
import { BasicRowItems, VariableRowMenu } from "./VariableRowMenuItems";
import "./VariableSectionItem.css";

interface Props {
  section: VariableSection;
  count: number;
}

export const VariableSectionItem = memo(function VariableSectionItem({
  section,
  count,
}: Props) {
  const t = useTranslation();

  const empty = count === 0;
  const sectionId = section.id;
  const collapsed = !!section.collapsed && !empty;

  const readMode = useStore((state) => state.mode === AppMode.READ);
  const pendingFocus = useStore(
    (state) => state.pendingFocusSectionId === sectionId,
  );

  const consumeSectionFocus = useStore((state) => state.consumeSectionFocus);
  const renameVariableSection = useStore(
    (state) => state.renameVariableSection,
  );
  const toggleVariableSection = useStore(
    (state) => state.toggleVariableSection,
  );
  const rename = useCallback(
    (name: string) => renameVariableSection(sectionId, name),
    [renameVariableSection, sectionId],
  );

  const toggle = () => toggleVariableSection(sectionId);

  // In read mode a click on the name folds the section
  const nameToggles = readMode && !empty;
  const handleHeaderClick = (event: MouseEvent) => {
    const target = event.target as Element;
    if (
      nameToggles &&
      target.closest(`.${CssClass.VARIABLE_SECTION_NAME}`) &&
      !target.closest(`.${CssClass.NOTE_LINK}`)
    ) {
      event.preventDefault();
      toggle();
    }
  };

  const headerRef = useRef<HTMLDivElement>(null);
  const toggleLabel = collapsed
    ? t.variables.expandSection
    : t.variables.collapseSection;

  return (
    <VariableRowFrame
      rowId={sectionId}
      className={classNames(
        "variable-section",
        collapsed && CssClass.COLLAPSED,
      )}
      dragImageRef={headerRef}
      menu={(className) => (
        <VariableRowMenu
          targetId={sectionId}
          kind={VariableEntryKind.SECTION}
          title={t.variables.sectionActions}
          className={className}
          sectioned
        >
          {(targets) => (
            <BasicRowItems
              targetId={sectionId}
              sectioned
              duplicateLabel={t.variables.duplicateSection(targets)}
              removeLabel={t.variables.removeSection(targets)}
            />
          )}
        </VariableRowMenu>
      )}
    >
      <div
        ref={headerRef}
        className={classNames(
          "variable-section-header",
          CssClass.VARIABLE_SURFACE,
        )}
        onClick={handleHeaderClick}
      >
        {!empty && (
          <button
            className={classNames(
              "btn btn-flat-icon variable-section-toggle",
              CssClass.SELECT_KEY_INERT,
            )}
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-label={toggleLabel}
            {...tooltip(toggleLabel)}
          >
            <SidebarSectionChevronIcon className="variable-section-chevron icon-md icon-bold" />
          </button>
        )}

        <NoteEditor
          value={section.name}
          onChange={rename}
          placeholder={t.variables.sectionPlaceholder}
          styleClass="style-section"
          className={classNames(
            CssClass.VARIABLE_SECTION_NAME,
            nameToggles && "is-clickable",
          )}
          focusRequested={pendingFocus}
          onFocusHandled={consumeSectionFocus}
        />

        {!empty && (
          <button
            className={classNames(
              "variable-section-count no-user-select",
              CssClass.SELECT_KEY_INERT,
            )}
            onClick={toggle}
            tabIndex={-1}
          >
            {t.variables.sectionCount(count)}
          </button>
        )}
      </div>
    </VariableRowFrame>
  );
});
