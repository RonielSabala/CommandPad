import { TooltipConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import {
  AriaRole,
  ButtonType,
  SelectionDirection,
} from "@/common/constants/dom";
import { EventType, PASSIVE, PASSIVE_CAPTURE } from "@/common/constants/events";
import { NoteFormat, NoteFormatState } from "@/common/enums";
import {
  formatBinding,
  KEYBINDINGS,
  SPACED_BINDING_SEPARATOR,
} from "@/common/keybindings";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { useTranslation } from "@/i18n";
import { getTextareaRangeRects, toPx } from "@/utils/dom";
import { planNoteFormats, type NoteRange } from "@/utils/markdown";
import { clamp } from "@/utils/number";
import { findScrollContainer, scrollParentBox } from "@/utils/scrollParent";
import { classNames } from "@/utils/string";
import {
  Fragment,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import {
  Code,
  ListOl,
  ListUl,
  TypeBold,
  TypeItalic,
  TypeStrikethrough,
  type Icon,
} from "react-bootstrap-icons";
import { createPortal } from "react-dom";

import "./NoteFormatToolbar.css";
import { formatNoteSelection, NOTE_FORMAT_BINDINGS } from "./useNoteFormatting";

const FORMAT_ICONS: Record<NoteFormat, Icon> = {
  [NoteFormat.BOLD]: TypeBold,
  [NoteFormat.ITALIC]: TypeItalic,
  [NoteFormat.STRIKETHROUGH]: TypeStrikethrough,
  [NoteFormat.CODE]: Code,
  [NoteFormat.NUMBERED_LIST]: ListOl,
  [NoteFormat.BULLETED_LIST]: ListUl,
};

/** Buttons in order, a separator between groups. */
const FORMAT_GROUPS: { formats: NoteFormat[]; boldIcons?: boolean }[] = [
  {
    formats: [
      NoteFormat.BOLD,
      NoteFormat.ITALIC,
      NoteFormat.STRIKETHROUGH,
      NoteFormat.CODE,
    ],
    boldIcons: true,
  },
  { formats: [NoteFormat.NUMBERED_LIST, NoteFormat.BULLETED_LIST] },
];

interface ToolbarAnchor {
  top: number;
  bottom: number;
  /** Where the selection ends. */
  caret: number;
}

interface ToolbarOffset extends ToolbarAnchor {
  width: number;
}

function placeAbove(
  anchor: ToolbarAnchor,
  size: { width: number; height: number },
  bounds: { top: number; bottom: number; left: number; right: number },
): { x: number; y: number } {
  const { GAP, VIEWPORT_MARGIN } = TooltipConfig;

  const minY = Math.max(bounds.top, 0) + VIEWPORT_MARGIN;
  const maxY =
    Math.min(bounds.bottom, window.innerHeight) - VIEWPORT_MARGIN - size.height;

  const above = anchor.top - GAP - size.height;
  const y = above >= minY ? above : anchor.bottom + GAP;

  const minX = Math.max(bounds.left, 0) + VIEWPORT_MARGIN;
  const maxX =
    Math.min(bounds.right, window.innerWidth) - VIEWPORT_MARGIN - size.width;

  return {
    x: Math.round(clamp(anchor.caret, minX, maxX)),
    y: Math.round(clamp(y, minY, maxY)),
  };
}

interface Props {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  selection: NoteRange;
  onChange: (value: string) => void;
}

export function NoteFormatToolbar({
  textareaRef,
  value,
  selection,
  onChange,
}: Props) {
  const t = useTranslation();
  const keepAnchorRef = useRef(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<ToolbarOffset | null>(null);

  const { from, to } = selection;
  const plans = useMemo(
    () => planNoteFormats(value, { from, to }),
    [value, from, to],
  );

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    const toolbar = toolbarRef.current;
    if (!textarea || !toolbar) {
      return;
    }

    // Measured against the field
    const measure = () => {
      const field = textarea.getBoundingClientRect();
      const lines = getTextareaRangeRects(textarea, from, to);
      const first = lines[0] ?? field;
      const caret =
        textarea.selectionDirection === SelectionDirection.BACKWARD
          ? first.left
          : (lines[lines.length - 1] ?? field).right;

      anchorRef.current = {
        top: first.top - field.top,
        bottom: first.bottom - field.top,
        caret: caret - field.left,
        width: field.width,
      };

      return anchorRef.current;
    };

    let offset =
      keepAnchorRef.current && anchorRef.current
        ? anchorRef.current
        : measure();
    const scroller = findScrollContainer(textarea);
    const size = toolbar.getBoundingClientRect();

    const placeAt = ({ left, top }: DOMRect) => {
      const { x, y } = placeAbove(
        {
          top: top + offset.top,
          bottom: top + offset.bottom,
          caret: left + offset.caret,
        },
        size,
        scrollParentBox(scroller),
      );

      toolbar.style.left = toPx(x);
      toolbar.style.top = toPx(y);
    };

    const place = () => placeAt(textarea.getBoundingClientRect());

    // Resizing a panel moves or rewraps the field without a window event
    const observer = new ResizeObserver(() => {
      const field = textarea.getBoundingClientRect();
      if (field.width !== offset.width) {
        offset = measure();
      }

      placeAt(field);
    });

    observer.observe(textarea);
    observer.observe(scroller);
    window.addEventListener(EventType.SCROLL, place, PASSIVE_CAPTURE);
    window.addEventListener(EventType.RESIZE, place, PASSIVE);
    return () => {
      observer.disconnect();
      window.removeEventListener(EventType.SCROLL, place, PASSIVE_CAPTURE);
      window.removeEventListener(EventType.RESIZE, place);
    };
  }, [textareaRef, value, from, to]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const release = () => {
      keepAnchorRef.current = false;
    };

    textarea.addEventListener(EventType.KEY_DOWN, release, PASSIVE);
    return () => textarea.removeEventListener(EventType.KEY_DOWN, release);
  }, [textareaRef]);

  const apply = (format: NoteFormat) => {
    const textarea = textareaRef.current;
    if (textarea) {
      keepAnchorRef.current = true;
      formatNoteSelection(textarea, format, onChange);
    }
  };

  return createPortal(
    <div
      ref={toolbarRef}
      className={classNames("note-format-toolbar", CssClass.NO_USER_SELECT)}
      role={AriaRole.TOOLBAR}
      aria-label={t.note.formatToolbar}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => event.stopPropagation()}
    >
      {FORMAT_GROUPS.map(({ formats, boldIcons }, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <span className="note-format-separator" role={AriaRole.SEPARATOR} />
          )}
          {formats.map((format) => {
            const { state } = plans[format];
            const Icon = FORMAT_ICONS[format];
            const label = t.note.format[format];
            const disabled = state === NoteFormatState.DISABLED;
            const binding = formatBinding(
              KEYBINDINGS[NOTE_FORMAT_BINDINGS[format]].binding,
              SPACED_BINDING_SEPARATOR,
            );

            return (
              <button
                key={format}
                type={ButtonType.BUTTON}
                className={classNames(
                  "note-format-button",
                  boldIcons && "is-bold-icon",
                  state === NoteFormatState.ON && "is-active",
                  CssClass.BTN,
                  CssClass.BTN_SOFT_ICON,
                )}
                aria-label={label}
                aria-pressed={state === NoteFormatState.ON}
                disabled={disabled}
                tabIndex={-1}
                onClick={() => apply(format)}
                {...tooltip(
                  disabled ? null : t.note.formatHint(label, binding),
                )}
              >
                <Icon className={CssClass.ICON} />
              </button>
            );
          })}
        </Fragment>
      ))}
    </div>,
    document.body,
  );
}
