import { EmptyStateIcon } from "@/components/icons";
import "./EmptyState.css";

export function EmptyState() {
  return (
    <div id="empty-state" className="no-user-select">
      <EmptyStateIcon />
      <p id="empty-state-title">No blocks yet.</p>
      <p id="empty-state-hint">Add a command or note below.</p>
    </div>
  );
}
