import { CssClass } from "@/common/constants/css";
import { SortDirection } from "@/common/enums";
import { useStore, type StoreState } from "@/store/store";
import { SortAlphaDown, SortAlphaUp } from "react-bootstrap-icons";

import { ContextMenuItem, ContextMenuSeparator } from "./ContextMenu";

interface Props {
  labels: Record<SortDirection, string>;
  canSort: (state: StoreState, direction: SortDirection) => boolean;
  onSort: (direction: SortDirection) => void;
}

function SortMenuItem({
  direction,
  labels,
  canSort,
  onSort,
}: Props & { direction: SortDirection }) {
  const enabled = useStore((state) => canSort(state, direction));
  const Icon = direction === SortDirection.ASC ? SortAlphaDown : SortAlphaUp;

  return (
    <ContextMenuItem
      icon={<Icon className={CssClass.ICON_MD} />}
      onSelect={() => onSort(direction)}
      disabled={!enabled}
    >
      {labels[direction]}
    </ContextMenuItem>
  );
}

export function SortMenuItems(props: Props) {
  return (
    <>
      <ContextMenuSeparator />
      <SortMenuItem direction={SortDirection.ASC} {...props} />
      <SortMenuItem direction={SortDirection.DESC} {...props} />
    </>
  );
}
