import { CssClass } from "@/common/constants/css";
import { AppMode, VariableEntryKind } from "@/common/enums";
import type { VariableSection } from "@/common/types";
import { NoteEditor } from "@/components/blocks/note/NoteEditor";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { memo, useCallback, useRef, type MouseEvent } from "react";

import { VariableRowFrame } from "./VariableRowFrame";
import { BasicRowItems, VariableRowMenu } from "./VariableRowMenuItems";
import { VariableSectionHeader } from "./VariableSectionHeader";
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

  return (
    <VariableRowFrame
      rowId={sectionId}
      className={classNames("variable-section")}
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
      <VariableSectionHeader
        ref={headerRef}
        className={CssClass.VARIABLE_SURFACE}
        collapsed={collapsed}
        count={count}
        onToggle={toggle}
        onClick={handleHeaderClick}
      >
        <NoteEditor
          value={section.name}
          onChange={rename}
          placeholder={t.variables.sectionPlaceholder}
          className={classNames(
            CssClass.VARIABLE_SECTION_NAME,
            nameToggles && "is-clickable",
          )}
          focusRequested={pendingFocus}
          onFocusHandled={consumeSectionFocus}
        />
      </VariableSectionHeader>
    </VariableRowFrame>
  );
});
