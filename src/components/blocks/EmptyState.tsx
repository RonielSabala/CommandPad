import { EmptyStateIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import "./EmptyState.css";

export function EmptyState() {
  const t = useTranslation();

  return (
    <div id="empty-state" className="no-user-select">
      <EmptyStateIcon id="empty-state-icon" className="icon-lg icon-bold" />
      <p id="empty-state-title">{t.blocks.emptyTitle}</p>
      <p id="empty-state-hint">{t.blocks.emptyHint}</p>
    </div>
  );
}
