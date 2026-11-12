import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function DragIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <circle cx="5" cy="4" r="1" />
      <circle cx="11" cy="4" r="1" />
      <circle cx="5" cy="8" r="1" />
      <circle cx="11" cy="8" r="1" />
      <circle cx="5" cy="12" r="1" />
      <circle cx="11" cy="12" r="1" />
    </svg>
  );
}

export function FolderOpenFillIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h2.764c.958 0 1.76.56 2.311 1.184C7.985 2.648 8.48 3 9 3h4.5A1.5 1.5 0 0 1 15 4.5V5H1z" />
      <path d="M.84 6h14.32a.7.7 0 0 1 .696.686l-.64 5.124A2.5 2.5 0 0 1 12.733 14H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A.7.7 0 0 1 .84 6z" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

export function PanelCollapseIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <polyline points="10,4 4,8 10,12" />
    </svg>
  );
}

export function PanelSideIcon({
  mirrored,
  ...props
}: IconProps & { mirrored?: boolean }) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
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
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <polyline points="4,6 8,10 12,6" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <circle cx="6.5" cy="6.5" r="4" />
      <line x1="10" y1="10" x2="14" y2="14" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M13.5 9.2A5.5 5.5 0 0 1 6.8 2.5a5.5 5.5 0 1 0 6.7 6.7z" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
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
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M13 1l2 2L5 13l-3 1 1-3L13 1z" />
    </svg>
  );
}

export function PadlockIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M5 7V5a3 3 0 0 1 6 0v2M3 7h10v7H3zM8 11v-1" />
    </svg>
  );
}

export function ChevronsRightIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M2 4l6 4-6 4M8 4l6 4-6 4" strokeWidth="1.5" />
    </svg>
  );
}

export function ExportIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M8 2v8M5 7l3 3 3-3M3 11v2h10v-2" />
    </svg>
  );
}

export function ImportIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M8 11V3M5 6l3-3 3 3M3 11v2h10v-2" />
    </svg>
  );
}

export function ClipIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M9.5 3.5L4.5 8.5a2 2 0 002.83 2.83l5-5A3.33 3.33 0 007.5 1.5l-5 5a4.67 4.67 0 006.6 6.6l4.9-4.9" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5l.5-9" />
    </svg>
  );
}

export function EyeIcon({
  slashed,
  ...props
}: IconProps & { slashed?: boolean }) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle
        cx="8"
        cy="8"
        r="2"
        style={{ fill: slashed ? "currentColor" : "none" }}
      />
      {slashed && <line x1="2" y1="2" x2="14" y2="14" />}
    </svg>
  );
}

export function NoteIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M3 3h10v8l-3 3H3z" />
      <path d="M13 11h-3v3" />
    </svg>
  );
}

export function CommandIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <line x1="2" y1="4.5" x2="5.5" y2="4.5" />
      <line x1="2" y1="8" x2="8.5" y2="8" />
      <polyline points="9,3.5 14,8 9,12.5" />
    </svg>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <rect x="2" y="3" width="12" height="10" rx="2" />
      <circle cx="10.5" cy="6.5" r="1" />
      <path d="M2.5 12.5L6 8.5l4.5 4" />
    </svg>
  );
}

export function RunbookIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M2.5 11.5V1.5h7.5" />
      <path d="M5.5 4.5h5l3 3v7h-8z" />
      <path d="M10.5 4.5v3h3" />
    </svg>
  );
}

export function DividerIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M1 8 C3 5, 5 11, 7 8 S11 5, 13 8 S15 5, 15 8" />
    </svg>
  );
}

export function VariableIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M6 2.5c-1.5 0-2 .7-2 2V6c0 1-.6 2-1.5 2 .9 0 1.5 1 1.5 2v1.5c0 1.3.5 2 2 2" />
      <path d="M10 2.5c1.5 0 2 .7 2 2V6c0 1 .6 2 1.5 2-.9 0-1.5 1-1.5 2v1.5c0 1.3-.5 2-2 2" />
    </svg>
  );
}

export function EnumIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M5 2.5c-1.3 0-1.7.6-1.7 1.8V6c0 1-.5 2-1.3 2 .8 0 1.3 1 1.3 2v1.7c0 1.2.4 1.8 1.7 1.8" />
      <path d="M11 2.5c1.3 0 1.7.6 1.7 1.8V6c0 1 .5 2 1.3 2-.8 0-1.3 1-1.3 2v1.7c0 1.2-.4 1.8-1.7 1.8" />
      <polyline points="5.8,8.2 7.3,9.7 10.2,6.3" />
    </svg>
  );
}

export function SectionIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M2 3.5h12" />
      <path d="M5 8h9M5 12.5h9" />
    </svg>
  );
}

export function EditorToggleChevronIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 12 12" {...props}>
      <polyline points="2,4 6,8 10,4" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <polyline points="2.5,8.5 6,12 13.5,3.5" />
    </svg>
  );
}

export function OptionIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <circle cx="8" cy="8" r="4.5" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <rect x="5" y="5" width="9" height="9" rx="1" />
      <path d="M3 11V2h9" />
    </svg>
  );
}

export function DuplicateIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M2 2H9V6L6 9H2Z" />
      <path d="M12 9v6M9 12h6" />
    </svg>
  );
}

export function ArrowBarUp(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M8 8V2M5 5l3-3 3 3" />
      <line x1="2" y1="12" x2="14" y2="12" />
    </svg>
  );
}

export function ArrowBarDown(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M8 8v6M5 11l3 3 3-3" />
      <line x1="2" y1="4" x2="14" y2="4" />
    </svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M8 3.5C6.8 2.3 5 2 3 2v11c2 0 3.8.3 5 1.5 1.2-1.2 3-1.5 5-1.5V2c-2 0-3.8.3-5 1.5z" />
      <path d="M8 3.5v11" />
    </svg>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" {...props}>
      <path d="M6.72 2.86L7.03 1.07L8.97 1.07L9.28 2.86L10.73 3.46L12.21 2.41L13.59 3.79L12.54 5.27L13.14 6.72L14.93 7.03L14.93 8.97L13.14 9.28L12.54 10.73L13.59 12.21L12.21 13.59L10.73 12.54L9.28 13.14L8.97 14.93L7.03 14.93L6.72 13.14L5.27 12.54L3.79 13.59L2.41 12.21L3.46 10.73L2.86 9.28L1.07 8.97L1.07 7.03L2.86 6.72L3.46 5.27L2.41 3.79L3.79 2.41L5.27 3.46z" />
      <circle cx="8" cy="8" r="2.25" />
    </svg>
  );
}

export function EmptyStateIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 40 40" {...props}>
      <rect x="4" y="6" width="32" height="28" rx="3" />
      <path d="M10 14l6 6-6 6M18 26h12" />
    </svg>
  );
}

export function ClearFormattingIcon(props: IconProps) {
  return (
    <svg aria-hidden={true} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M12.258 3h-8.51l-.083 2.46h.479c.26-1.544.758-1.783 2.693-1.845l.424-.013v7.827c0 .663-.144.82-1.3.923v.52h4.082v-.52c-1.162-.103-1.306-.26-1.306-.923V3.602l.431.013c1.934.062 2.434.301 2.693 1.846h.479z" />
      <line
        x1="3"
        y1="3"
        x2="13"
        y2="13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
