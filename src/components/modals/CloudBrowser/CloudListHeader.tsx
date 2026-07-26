import { useTranslation } from "@/i18n";

export function CloudListHeader() {
  const t = useTranslation();

  return (
    <div className="cloud-browser-list-header">
      <span>{t.cloudModal.columnName}</span>
      <span>{t.cloudModal.columnModified}</span>
      <span className="cloud-browser-col-size">{t.cloudModal.columnSize}</span>
    </div>
  );
}
