import { CloudSortColumn, SortDirection } from "@/common/enums";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { CaretDownFill, CaretUpFill } from "react-bootstrap-icons";
import "./CloudListHeader.css";

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

  return (
    <div className="cloud-browser-list-header">
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
