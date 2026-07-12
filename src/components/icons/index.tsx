import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function DragIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <circle cx="5" cy="4" r="1" />
      <circle cx="11" cy="4" r="1" />
      <circle cx="5" cy="8" r="1" />
      <circle cx="11" cy="8" r="1" />
      <circle cx="5" cy="12" r="1" />
      <circle cx="11" cy="12" r="1" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

export function SidebarCollapseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <polyline points="10,4 4,8 10,12" />
    </svg>
  );
}

export function SidebarPositionIcon({
  mirrored,
  ...props
}: IconProps & { mirrored?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <rect x="1" y="2" width="14" height="12" rx="1" />
      <line
        x1={mirrored ? "5" : "11"}
        y1="2"
        x2={mirrored ? "5" : "11"}
        y2="14"
      />
    </svg>
  );
}

export function SidebarSectionChevronIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <polyline points="4,6 8,10 12,6" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <circle cx="6.5" cy="6.5" r="4" />
      <line x1="10" y1="10" x2="14" y2="14" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M13.5 9.2A5.5 5.5 0 0 1 6.8 2.5a5.5 5.5 0 1 0 6.7 6.7z" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <circle cx="8" cy="8" r="3.25" />
      <line x1="8" y1="1" x2="8" y2="2.5" />
      <line x1="8" y1="13.5" x2="8" y2="15" />
      <line x1="1" y1="8" x2="2.5" y2="8" />
      <line x1="13.5" y1="8" x2="15" y2="8" />
      <line x1="3.05" y1="3.05" x2="4.1" y2="4.1" />
      <line x1="11.9" y1="11.9" x2="12.95" y2="12.95" />
      <line x1="12.95" y1="3.05" x2="11.9" y2="4.1" />
      <line x1="4.1" y1="11.9" x2="3.05" y2="12.95" />
    </svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M13 1l2 2L5 13l-3 1 1-3L13 1z" />
    </svg>
  );
}

export function PadlockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M5 7V5a3 3 0 0 1 6 0v2M3 7h10v7H3zM8 11v-1" />
    </svg>
  );
}

export function ChevronsRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M2 4l6 4-6 4M8 4l6 4-6 4" strokeWidth="1.5" />
    </svg>
  );
}

export function KeyboardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01" />
      <path d="M5 14h14" />
    </svg>
  );
}

export function ExportIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M8 2v8M5 7l3 3 3-3M3 11v2h10v-2" />
    </svg>
  );
}

export function ImportIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M8 11V3M5 6l3-3 3 3M3 11v2h10v-2" />
    </svg>
  );
}

export function ClipIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M9.5 3.5L4.5 8.5a2 2 0 002.83 2.83l5-5A3.33 3.33 0 007.5 1.5l-5 5a4.67 4.67 0 006.6 6.6l4.9-4.9" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5l.5-9" />
    </svg>
  );
}

export function EyeIcon({
  slashed,
  ...props
}: IconProps & { slashed?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
      {slashed && <line x1="2" y1="2" x2="14" y2="14" />}
    </svg>
  );
}

export function NoteIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M3 3h10v8l-3 3H3z" />
      <path d="M10 11v3" />
    </svg>
  );
}

export function CommandIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <line x1="2" y1="4.5" x2="5.5" y2="4.5" />
      <line x1="2" y1="8" x2="8.5" y2="8" />
      <polyline points="9,3.5 14,8 9,12.5" />
    </svg>
  );
}

export function DividerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M1 8 C3 5, 5 11, 7 8 S11 5, 13 8 S15 5, 15 8" />
    </svg>
  );
}

export function EditorToggleChevronIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 12 12" {...props}>
      <polyline points="2,4 6,8 10,4" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <polyline points="2,8 6,12 14,4" stroke="var(--success)" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <rect x="5" y="5" width="9" height="9" rx="1" />
      <path d="M3 11V2h9" />
    </svg>
  );
}

export function DuplicateIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <rect x="2" y="2" width="9" height="9" rx="1" />
      <path d="M12 10v4M10 12h4" />
    </svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M8 3.5C6.8 2.3 5 2 3 2v11c2 0 3.8.3 5 1.5 1.2-1.2 3-1.5 5-1.5V2c-2 0-3.8.3-5 1.5z" />
      <path d="M8 3.5v11" />
    </svg>
  );
}

export function EmptyStateIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 40 40" {...props}>
      <rect x="4" y="6" width="32" height="28" rx="3" />
      <path d="M10 14l6 6-6 6M18 26h12" />
    </svg>
  );
}
