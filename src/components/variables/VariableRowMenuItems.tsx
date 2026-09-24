import { InsertPosition, VariableEntryKind } from "@/common/enums";
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
import { useStore } from "@/store/store";
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

interface MixedSelectionProps extends Props {
  /** Whether this surface shows sections. */
  sectioned?: boolean;
}

export function MixedSelectionItems({
  targetId,
  sectioned,
}: MixedSelectionProps) {
  const t = useTranslation();
  const duplicateVariable = useStore((state) => state.duplicateVariable);
  const removeVariable = useStore((state) => state.removeVariable);

  return (
    <>
      <ContextMenuItem
        icon={<DuplicateIcon className="icon-md icon-bold" />}
        onSelect={() => duplicateVariable(targetId)}
      >
        {t.variables.duplicateItems}
      </ContextMenuItem>

      {sectioned && <VariableInsertItems targetId={targetId} />}

      <ContextMenuItem
        icon={<TrashIcon className="icon-md icon-bold" />}
        onSelect={() => removeVariable(targetId)}
        danger
      >
        {t.variables.removeItems}
      </ContextMenuItem>
    </>
  );
}
