import { ElementId } from "@/common/constants/dom";

export function EmptyState() {
  return (
    <div id={ElementId.EMPTY_STATE} className="no-user-select">
      <svg viewBox="0 0 40 40">
        <rect x="4" y="6" width="32" height="28" rx="3" />
        <path d="M10 14l6 6-6 6M18 26h12" />
      </svg>
      <p id={ElementId.EMPTY_STATE_TITLE}>No blocks yet.</p>
      <p id={ElementId.EMPTY_STATE_HINT}>Add a command or note below.</p>
    </div>
  );
}
