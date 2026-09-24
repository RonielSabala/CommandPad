import { InsertPosition, VariableEntryKind } from "@/common/enums";
import { ActionsMenu } from "@/components/common/contextMenu/ActionsMenu";
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/common/contextMenu/ContextMenu";
import { ContextMenuSubmenu } from "@/components/common/contextMenu/ContextMenuSubmenu";
import {
  DuplicateIcon,
  InsertAboveIcon,
  InsertBelowIcon,
  SectionIcon,
  TrashIcon,
  VariableIcon,
} from "@/components/icons";
import { useTranslation } from "@/i18n";
import { countVariableTargets, useStore } from "@/store/store";
import type { ReactNode } from "react";

interface Props {
  targetId: string;
}

interface InsertSubmenuProps extends Props {
  position: InsertPosition;
  label: string;
  icon: ReactNode;
}

function InsertSubmenu({
  targetId,
  position,
  label,
  icon,
}: InsertSubmenuProps) {
  const t = useTranslation();
  const insertVariableRow = useStore((state) => state.insertVariableRow);

  return (
    <ContextMenuSubmenu icon={icon} label={label}>
      <ContextMenuItem
        icon={<VariableIcon className="icon-md icon-bold" />}
        onSelect={() =>
          insertVariableRow(targetId, VariableEntryKind.VARIABLE, position)
        }
      >
        {t.variables.variableLabel}
      </ContextMenuItem>
      <ContextMenuItem
        icon={<SectionIcon className="icon-md icon-bold" />}
        onSelect={() =>
          insertVariableRow(targetId, VariableEntryKind.SECTION, position)
        }
      >
        {t.variables.sectionLabel}
      </ContextMenuItem>
    </ContextMenuSubmenu>
  );
}

export function VariableInsertItems({ targetId }: Props) {
  const t = useTranslation();

  return (
    <>
      <ContextMenuSeparator />
      <InsertSubmenu
        targetId={targetId}
        position={InsertPosition.ABOVE}
        label={t.variables.insertAbove}
        icon={<InsertAboveIcon className="icon-md icon-bold" />}
      />
      <InsertSubmenu
        targetId={targetId}
        position={InsertPosition.BELOW}
        label={t.variables.insertBelow}
        icon={<InsertBelowIcon className="icon-md icon-bold" />}
      />
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
      icon={<DuplicateIcon className="icon-md icon-bold" />}
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
      icon={<TrashIcon className="icon-md icon-bold" />}
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
  duplicateLabel: string;
  removeLabel: string;
}

export function BasicRowItems({
  targetId,
  sectioned,
  duplicateLabel,
  removeLabel,
}: BasicItemsProps) {
  return (
    <>
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
  children: (count: number) => ReactNode;
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
  const count = useStore((state) => {
    const targets = countVariableTargets(state, targetId);

    return targets[VariableEntryKind.VARIABLE] > 0 &&
      targets[VariableEntryKind.SECTION] > 0
      ? null
      : targets[kind];
  });

  return (
    <ActionsMenu className={className} title={title}>
      {count === null ? (
        <BasicRowItems
          targetId={targetId}
          sectioned={sectioned}
          duplicateLabel={t.variables.duplicateItems}
          removeLabel={t.variables.removeItems}
        />
      ) : (
        children(count)
      )}
    </ActionsMenu>
  );
}
