import { CssClass } from "@/common/constants/css";
import { VariableEntryKind } from "@/common/enums";
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/common/contextMenu/ContextMenu";
import { ContextMenuSubmenu } from "@/components/common/contextMenu/ContextMenuSubmenu";
import { SortMenuItems } from "@/components/common/contextMenu/SortMenuItems";
import { EyeIcon, TrashIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import {
  getActiveTab,
  hasOptionsToSort,
  hasOtherOptions,
  hasValuesToClear,
  useStore,
} from "@/store/store";
import { getCaseOperationKeywords } from "@/utils/resolution";
import { classNames } from "@/utils/string";
import type { ReactNode } from "react";
import { AlphabetUppercase, Collection, Eraser } from "react-bootstrap-icons";

import {
  DuplicateItem,
  RemoveItem,
  VariableInsertItems,
  VariableRowMenu,
} from "./VariableRowMenuItems";

const CASE_KEYWORDS = getCaseOperationKeywords();

interface ItemProps {
  variableId: string;
  children: ReactNode;
}

function ClearValuesItem({ variableId, children }: ItemProps) {
  const clearVariableValues = useStore((state) => state.clearVariableValues);
  const hasValues = useStore((state) => hasValuesToClear(state, variableId));

  if (!hasValues) {
    return null;
  }

  return (
    <ContextMenuItem
      icon={<Eraser className={CssClass.ICON_MD} />}
      onSelect={() => clearVariableValues(variableId)}
    >
      {children}
    </ContextMenuItem>
  );
}

function RemoveOtherOptionsItem({ variableId, children }: ItemProps) {
  const hasOthers = useStore((state) => hasOtherOptions(state, variableId));
  const removeOtherVariableOptions = useStore(
    (state) => state.removeOtherVariableOptions,
  );

  return (
    <ContextMenuItem
      icon={
        <TrashIcon
          className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
        />
      }
      onSelect={() => removeOtherVariableOptions(variableId)}
      disabled={!hasOthers}
      danger
    >
      {children}
    </ContextMenuItem>
  );
}

interface Props {
  variableId: string;
  isSecret: boolean;
  isEnum: boolean;
  className: string;
  /** Whether this surface shows sections. */
  sectioned?: boolean;
}

export function VariableActionsMenu({
  variableId,
  isSecret,
  isEnum,
  className,
  sectioned,
}: Props) {
  const t = useTranslation();
  const toggleVariableSecret = useStore((state) => state.toggleVariableSecret);
  const applyVariableKeyCase = useStore((state) => state.applyVariableKeyCase);
  const addVariableSection = useStore((state) => state.addVariableSection);
  const sortVariableOptions = useStore((state) => state.sortVariableOptions);
  const hasManyOptions = useStore(
    (state) =>
      (getActiveTab(state)?.variables.find((v) => v.id === variableId)?.options
        ?.length ?? 0) > 1,
  );

  return (
    <VariableRowMenu
      targetId={variableId}
      kind={VariableEntryKind.VARIABLE}
      title={t.variables.actions}
      className={className}
      sectioned={sectioned}
    >
      {(count, selectItem) => (
        <>
          {!isEnum && (
            <ContextMenuItem
              icon={
                <EyeIcon
                  slashed={!isSecret}
                  className={classNames(CssClass.ICON_MD, CssClass.ICON_BOLD)}
                />
              }
              onSelect={() => toggleVariableSecret(variableId)}
            >
              {isSecret ? t.variables.reveal(count) : t.variables.mask(count)}
            </ContextMenuItem>
          )}

          {selectItem}

          <DuplicateItem targetId={variableId}>
            {t.variables.duplicate(count)}
          </DuplicateItem>

          <ContextMenuSubmenu
            icon={<AlphabetUppercase className={CssClass.ICON_MD} />}
            label={t.variables.renameCase}
            iconlessItems
          >
            {CASE_KEYWORDS.map((keyword) => (
              <ContextMenuItem
                key={keyword}
                onSelect={() => applyVariableKeyCase(variableId, keyword)}
              >
                {keyword}
              </ContextMenuItem>
            ))}
          </ContextMenuSubmenu>

          <ClearValuesItem variableId={variableId}>
            {t.variables.clearValues(count)}
          </ClearValuesItem>

          {sectioned && (
            <ContextMenuItem
              icon={<Collection className={CssClass.ICON_MD} />}
              onSelect={() => addVariableSection(variableId)}
            >
              {t.variables.moveToNewSection(count)}
            </ContextMenuItem>
          )}

          {hasManyOptions && (
            <>
              <ContextMenuSeparator />
              <SortMenuItems
                labels={t.variables.sortOptions}
                canSort={(state, direction) =>
                  hasOptionsToSort(state, variableId, direction)
                }
                onSort={(direction) =>
                  sortVariableOptions(variableId, direction)
                }
              />
            </>
          )}

          {sectioned ? (
            <VariableInsertItems targetId={variableId} />
          ) : (
            <ContextMenuSeparator />
          )}

          {hasManyOptions && (
            <RemoveOtherOptionsItem variableId={variableId}>
              {t.variables.removeOtherOptions}
            </RemoveOtherOptionsItem>
          )}

          <RemoveItem targetId={variableId}>
            {t.variables.remove(count)}
          </RemoveItem>
        </>
      )}
    </VariableRowMenu>
  );
}
