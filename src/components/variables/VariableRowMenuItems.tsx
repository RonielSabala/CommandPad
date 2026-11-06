import { CssClass } from "@/common/constants/css";
import {
  VariableEntryKind,
  VariableKind,
  type InsertPosition,
} from "@/common/enums";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/common/contextMenu/ContextMenu";
import { InsertSubmenus } from "@/components/common/contextMenu/InsertSubmenus";
import { SelectionActionsContext } from "@/components/common/contextMenu/selectionActionsContext";
import { SelectionToggleItem } from "@/components/common/contextMenu/SelectionToggleItem";
import { InfoMenuItem } from "@/components/common/info/InfoMenuItem";
import { useInfoTooltip } from "@/components/common/info/useInfoTooltip";
import {
  EnumIcon,
  SectionIcon,
  TrashIcon,
  VariableIcon,
} from "@/components/icons";
import { useTranslation } from "@/i18n";
import { countVariableTargets, useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useContext, type ReactNode } from "react";
import { Copy } from "react-bootstrap-icons";

import { VariableRowInfo } from "./info/VariableRowInfo";

interface Props {
  targetId: string;
}

interface InsertItemsProps extends Props {
  position: InsertPosition;
}

function InsertItems({ targetId, position }: InsertItemsProps) {
  const t = useTranslation();
  const insertVariableRow = useStore((state) => state.insertVariableRow);

  return (
    <>
      <ContextMenuItem
        icon={
          <VariableIcon
            className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
          />
        }
        onSelect={() =>
          insertVariableRow(targetId, VariableEntryKind.VARIABLE, position)
        }
      >
        {t.variables.variableLabel}
      </ContextMenuItem>

      <ContextMenuItem
        icon={
          <EnumIcon
            className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
          />
        }
        onSelect={() =>
          insertVariableRow(
            targetId,
            VariableEntryKind.VARIABLE,
            position,
            VariableKind.ENUM,
          )
        }
      >
        {t.variables.enumLabel}
      </ContextMenuItem>

      <ContextMenuItem
        icon={
          <SectionIcon
            className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
          />
        }
        onSelect={() =>
          insertVariableRow(targetId, VariableEntryKind.SECTION, position)
        }
      >
        {t.variables.sectionLabel}
      </ContextMenuItem>
    </>
  );
}

export function VariableInsertItems({ targetId }: Props) {
  const t = useTranslation();

  return (
    <>
      <ContextMenuSeparator />
      <InsertSubmenus
        aboveLabel={t.variables.insertAbove}
        belowLabel={t.variables.insertBelow}
      >
        {(position) => <InsertItems targetId={targetId} position={position} />}
      </InsertSubmenus>
      <ContextMenuSeparator />
    </>
  );
}

interface ItemProps extends Props {
  children: ReactNode;
}

export function DuplicateItem({ targetId, children }: ItemProps) {
  const duplicateVariable = useStore((state) => state.duplicateVariable);

  return (
    <ContextMenuItem
      icon={<Copy className={CssClass.ICON_MD} />}
      onSelect={() => duplicateVariable(targetId)}
    >
      {children}
    </ContextMenuItem>
  );
}

export function RemoveItem({ targetId, children }: ItemProps) {
  const removeVariable = useStore((state) => state.removeVariable);

  return (
    <ContextMenuItem
      icon={
        <TrashIcon
          className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
        />
      }
      onSelect={() => removeVariable(targetId)}
      danger
    >
      {children}
    </ContextMenuItem>
  );
}

interface BasicItemsProps extends Props {
  /** Whether this surface shows sections. */
  sectioned?: boolean;
  selectItem: ReactNode;
  duplicateLabel: string;
  removeLabel: string;
}

export function BasicRowItems({
  targetId,
  sectioned,
  selectItem,
  duplicateLabel,
  removeLabel,
}: BasicItemsProps) {
  return (
    <>
      {selectItem}
      <DuplicateItem targetId={targetId}>{duplicateLabel}</DuplicateItem>

      {sectioned && <VariableInsertItems targetId={targetId} />}

      <RemoveItem targetId={targetId}>{removeLabel}</RemoveItem>
    </>
  );
}

interface MenuProps extends Props {
  kind: VariableEntryKind;
  title: string;
  className: string;
  sectioned?: boolean;
  children: (count: number, selectItem: ReactNode) => ReactNode;
}

export function VariableRowMenu({
  targetId,
  kind,
  title,
  className,
  sectioned,
  children,
}: MenuProps) {
  const t = useTranslation();
  const info = useInfoTooltip();
  const canSelect = useContext(SelectionActionsContext);
  const toggleVariableSelection = useStore(
    (state) => state.toggleVariableSelection,
  );
  const isSelected = useStore((state) =>
    state.selectedVariableIds.has(targetId),
  );
  const count = useStore((state) => {
    const targets = countVariableTargets(state, targetId);

    return targets[VariableEntryKind.VARIABLE] > 0 &&
      targets[VariableEntryKind.SECTION] > 0
      ? null
      : targets[kind];
  });

  const selectItem = sectioned && canSelect && (
    <SelectionToggleItem
      selected={isSelected}
      onToggle={() => toggleVariableSelection(targetId)}
      selectLabel={t.variables.selectRow[kind]}
      deselectLabel={t.variables.deselectRow[kind]}
    />
  );

  return (
    <>
      <ActionsMenu
        className={classNames(className, info.menuClassName)}
        title={title}
        triggerRef={info.triggerRef}
      >
        <InfoMenuItem onSelect={info.open} />

        <ContextMenuSeparator />

        {count === null ? (
          <BasicRowItems
            targetId={targetId}
            sectioned={sectioned}
            selectItem={selectItem}
            duplicateLabel={t.variables.duplicateItems}
            removeLabel={t.variables.removeItems}
          />
        ) : (
          children(count, selectItem)
        )}
      </ActionsMenu>

      {info.render(() => (
        <VariableRowInfo targetId={targetId} kind={kind} />
      ))}
    </>
  );
}
