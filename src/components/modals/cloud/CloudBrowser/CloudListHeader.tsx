import { CloudSortColumn, SortDirection } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { CaretDownFill, CaretUpFill } from "react-bootstrap-icons";

import "./CloudListHeader.css";
import { CloudSelectCircle } from "./CloudSelectCircle";
import { useCloudSelection } from "./cloudSelection";

interface SortButtonProps {
  column: CloudSortColumn;
  label: string;
  className?: string;
}

function SortButton({ column, label, className }: SortButtonProps) {
  const t = useTranslation();
  const sort = useStore((state) => state.cloudSort);
  const toggleCloudSort = useStore((state) => state.toggleCloudSort);

  const active = sort.column === column;
  const ascending = sort.direction === SortDirection.ASC;
  const nextAscending = active ? !ascending : column === CloudSortColumn.NAME;
  const title = nextAscending
    ? t.cloudModal.sortAscending(label)
    : t.cloudModal.sortDescending(label);

  const Caret = ascending ? CaretUpFill : CaretDownFill;

  return (
    <button
      className={classNames(
        "cloud-browser-sort",
        active && "is-active",
        className,
      )}
      onClick={() => toggleCloudSort(column)}
      title={title}
      aria-label={title}
    >
      {label}
      {active && <Caret className="cloud-browser-sort-caret" />}
    </button>
  );
}

export function CloudListHeader() {
  const t = useTranslation();
  const { rows } = useCloudSelection();
  const selectedEntries = useStore((state) => state.cloudSelectedEntries);
  const setCloudSelection = useStore((state) => state.setCloudSelection);

  const allSelected =
    rows.length > 0 && rows.every((entry) => selectedEntries.has(entry.id));

  const toggleAll = () => {
    const listed = new Set(rows.map((entry) => entry.id));
    const rest = [...selectedEntries.values()]
      .map((picked) => picked.entry)
      .filter((entry) => !listed.has(entry.id));

    setCloudSelection(allSelected ? rest : [...rest, ...rows]);
  };

  return (
    <div className="cloud-browser-list-header">
      <CloudSelectCircle
        selected={allSelected}
        title={allSelected ? t.cloudModal.deselectAll : t.cloudModal.selectAll}
        onToggle={toggleAll}
      />

      <SortButton
        column={CloudSortColumn.NAME}
        label={t.cloudModal.columnName}
      />
      <SortButton
        column={CloudSortColumn.MODIFIED}
        label={t.cloudModal.columnModified}
      />
      <SortButton
        column={CloudSortColumn.SIZE}
        label={t.cloudModal.columnSize}
        className="cloud-browser-col-size"
      />
    </div>
  );
}
