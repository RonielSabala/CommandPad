import { CssClass } from "@/common/constants/css";
import { DataAttr } from "@/common/constants/dom";
import { AppMode, DragGroup, LassoMode, SelectionGroup } from "@/common/enums";
import type { VariableSection } from "@/common/types";
import { NoteEditor } from "@/components/blocks/note/NoteEditor";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import { ContextMenuItem } from "@/components/common/contextMenu/ContextMenu";
import { tooltip } from "@/components/common/tooltip/tooltip";
import {
  DragIcon,
  DuplicateIcon,
  SidebarSectionChevronIcon,
  TrashIcon,
} from "@/components/icons";
import { lasso } from "@/hooks/lasso";
import { useRowReorder } from "@/hooks/useRowReorder";
import { useTranslation } from "@/i18n";
import { countVariableTargets, useStore, useStoreApi } from "@/store/store";
import { classNames } from "@/utils/string";
import { memo, useCallback, useRef, type MouseEvent } from "react";

import {
  MixedSelectionItems,
  VariableInsertItems,
} from "./VariableRowMenuItems";

import "./VariableItem.css";
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
  const store = useStoreApi();

  const empty = count === 0;
  const sectionId = section.id;
  const collapsed = !!section.collapsed && !empty;

  const readMode = useStore((state) => state.mode === AppMode.READ);
  const isFlashing = useStore((state) => state.flashVariableIds.has(sectionId));
  const isSelected = useStore((state) =>
    state.selectedVariableIds.has(sectionId),
  );
  const pendingFocus = useStore(
    (state) => state.pendingFocusSectionId === sectionId,
  );

  const sectionCount = useStore(
    (state) => countVariableTargets(state, sectionId).sections,
  );
  const mixed = useStore(
    (state) => countVariableTargets(state, sectionId).variables > 0,
  );

  const removeVariable = useStore((state) => state.removeVariable);
  const duplicateVariable = useStore((state) => state.duplicateVariable);
  const setVariableSelected = useStore((state) => state.setVariableSelected);
  const clearVariableFlash = useStore((state) => state.clearVariableFlash);
  const consumeSectionFocus = useStore((state) => state.consumeSectionFocus);
  const reorderVariables = useStore((state) => state.reorderVariables);

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
  const { isDragging, isDragOver, handleProps, rowProps } = useRowReorder(
    DragGroup.VARIABLE,
    sectionId,
    reorderVariables,
    !readMode,
    headerRef,
  );

  const toggleLabel = collapsed
    ? t.variables.expandSection
    : t.variables.collapseSection;

  return (
    <div
      className={classNames(
        CssClass.VARIABLE_ITEM,
        CssClass.VARIABLE_SECTION,
        collapsed && CssClass.COLLAPSED,
        isDragging && CssClass.DRAGGING,
        isDragOver && CssClass.DRAG_OVER,
        isSelected && CssClass.VARIABLE_SELECTED,
        isFlashing && CssClass.DUPLICATE_FLASH,
      )}
      {...{ [DataAttr.VARIABLE_ID]: sectionId }}
      {...rowProps}
      onMouseEnter={() => {
        const drag = lasso[SelectionGroup.VARIABLE];
        if (drag.active && store.getState().mode !== AppMode.READ) {
          setVariableSelected(sectionId, drag.mode === LassoMode.SELECT);
        }
      }}
      onAnimationEnd={() => {
        if (isFlashing) {
          clearVariableFlash(sectionId);
        }
      }}
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

      <div
        className={classNames(
          CssClass.VARIABLE_DRAG_HANDLE,
          CssClass.SELECT_KEY_HIDDEN,
        )}
      >
        <div
          className={CssClass.DRAG_HANDLE}
          {...tooltip(t.common.dragToReorder)}
          {...handleProps}
        >
          <DragIcon className="icon-md" />
        </div>
      </div>

      <ActionsMenu
        className={classNames(
          CssClass.VARIABLE_ACTIONS,
          CssClass.SELECT_KEY_HIDDEN,
        )}
        title={t.variables.sectionActions}
      >
        {mixed ? (
          <MixedSelectionItems targetId={sectionId} sectioned />
        ) : (
          <>
            <ContextMenuItem
              icon={<DuplicateIcon className="icon-md icon-bold" />}
              onSelect={() => duplicateVariable(sectionId)}
            >
              {t.variables.duplicateSection(sectionCount)}
            </ContextMenuItem>

            <VariableInsertItems targetId={sectionId} />

            <ContextMenuItem
              icon={<TrashIcon className="icon-md icon-bold" />}
              onSelect={() => removeVariable(sectionId)}
              danger
            >
              {t.variables.removeSection(sectionCount)}
            </ContextMenuItem>
          </>
        )}
      </ActionsMenu>
    </div>
  );
});
