export function DragDotsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size}>
      <circle cx="5" cy="4" r="1" />
      <circle cx="11" cy="4" r="1" />
      <circle cx="5" cy="8" r="1" />
      <circle cx="11" cy="8" r="1" />
      <circle cx="5" cy="12" r="1" />
      <circle cx="11" cy="12" r="1" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}
