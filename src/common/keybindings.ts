import { toTitleCase } from "../utils/string";
import { Modifier } from "./constants/events";

export const ModifierAction = {
  SELECT_BLOCKS: Modifier.SHIFT,
  OPEN_LINK: Modifier.CTRL,
} as const;

export function isModifierPressed(
  event: KeyboardEvent | MouseEvent,
  modifier: Modifier,
): boolean {
  switch (modifier) {
    case Modifier.CTRL:
      return event.ctrlKey || event.metaKey;
    case Modifier.ALT:
      return event.altKey;
    case Modifier.SHIFT:
      return event.shiftKey;
  }
}

export const KeyBinding = {
  TOGGLE_MODE: "TOGGLE_MODE",
  NEW_TAB: "NEW_TAB",
  CLOSE_TAB: "CLOSE_TAB",
  TOGGLE_EDITORS: "TOGGLE_EDITORS",
  DELETE_RUNBOOK: "DELETE_RUNBOOK",
  IMPORT_RUNBOOK: "IMPORT_RUNBOOK",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
  MOVE_SIDEBAR: "MOVE_SIDEBAR",
  DUPLICATE_BLOCK: "DUPLICATE_BLOCK",
  DELETE_BLOCK: "DELETE_BLOCK",
  ESCAPE: "ESCAPE",
  EXPORT: "EXPORT",
  CLEAR_LIBRARY: "CLEAR_LIBRARY",
  FOCUS_RUNBOOK: "FOCUS_RUNBOOK",
  NAVIGATE_RUNBOOKS: "NAVIGATE_RUNBOOKS",
  OPEN_LINK: "OPEN_LINK",
  TOGGLE_MINIMAP: "TOGGLE_MINIMAP",
  MULTISELECT_BLOCKS: "MULTISELECT_BLOCKS",
  NOTE_BOLD: "NOTE_BOLD",
  NOTE_ITALIC: "NOTE_ITALIC",
  NOTE_CODE: "NOTE_CODE",
  WRAP_SELECTION: "WRAP_SELECTION",
} as const;
export type KeyBinding = (typeof KeyBinding)[keyof typeof KeyBinding];

interface KeybindingDef {
  binding: string;
  keyboard?: boolean;
}

export const KEYBINDINGS: Record<KeyBinding, KeybindingDef> = {
  [KeyBinding.TOGGLE_MODE]: { binding: "ctrl+e" },
  [KeyBinding.NEW_TAB]: { binding: "ctrl+alt+n" },
  [KeyBinding.CLOSE_TAB]: { binding: "ctrl+alt+w" },
  [KeyBinding.TOGGLE_EDITORS]: { binding: "ctrl+g" },
  [KeyBinding.DELETE_RUNBOOK]: { binding: "ctrl+shift+d" },
  [KeyBinding.IMPORT_RUNBOOK]: { binding: "ctrl+i" },
  [KeyBinding.TOGGLE_SIDEBAR]: { binding: "ctrl+s" },
  [KeyBinding.MOVE_SIDEBAR]: { binding: "ctrl+shift+s" },
  [KeyBinding.DUPLICATE_BLOCK]: { binding: "ctrl+d" },
  [KeyBinding.DELETE_BLOCK]: { binding: "delete" },
  [KeyBinding.ESCAPE]: { binding: "escape" },
  [KeyBinding.EXPORT]: { binding: "ctrl+shift+e" },
  [KeyBinding.CLEAR_LIBRARY]: { binding: "ctrl+shift+backspace" },
  [KeyBinding.FOCUS_RUNBOOK]: { binding: "tab" },
  [KeyBinding.NAVIGATE_RUNBOOKS]: { binding: "↑ / ↓", keyboard: false },
  [KeyBinding.OPEN_LINK]: {
    binding: `${ModifierAction.OPEN_LINK}+click`,
    keyboard: false,
  },
  [KeyBinding.TOGGLE_MINIMAP]: { binding: "right-click", keyboard: false },
  [KeyBinding.MULTISELECT_BLOCKS]: {
    binding: `${ModifierAction.SELECT_BLOCKS}+click / drag`,
    keyboard: false,
  },
  [KeyBinding.NOTE_BOLD]: { binding: "ctrl+b", keyboard: false },
  [KeyBinding.NOTE_ITALIC]: { binding: "ctrl+i", keyboard: false },
  [KeyBinding.NOTE_CODE]: { binding: "ctrl+´", keyboard: false },
  [KeyBinding.WRAP_SELECTION]: {
    binding: `( [ { " '`,
    keyboard: false,
  },
};

const BINDING_SEPARATOR = "+";
const MODIFIER_KEYS = [Modifier.ALT, Modifier.CTRL, Modifier.SHIFT] as const;

const KEY_ALIASES: Record<string, string> = { space: " " };
const KEY_LABELS: Record<string, string> = { delete: "Del" };

function titleCaseChord(chord: string): string {
  return chord
    .split(BINDING_SEPARATOR)
    .map((token) => KEY_LABELS[token] ?? toTitleCase(token))
    .join(BINDING_SEPARATOR);
}

export function formatBinding(binding: string): string {
  if (!binding.includes(" ")) {
    return titleCaseChord(binding);
  }

  return binding
    .split(" ")
    .map((part) =>
      part.includes(BINDING_SEPARATOR) || /[a-z]/.test(part)
        ? titleCaseChord(part)
        : part,
    )
    .join(" ");
}

interface ParsedBinding {
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
  key: string;
}

const parsedBindings: Partial<Record<KeyBinding, ParsedBinding>> =
  Object.fromEntries(
    Object.entries(KEYBINDINGS)
      .filter(([, def]) => def.keyboard !== false)
      .map(([id, { binding }]) => {
        const parts = binding.toLowerCase().split(BINDING_SEPARATOR);
        const rawKey = parts.at(-1) ?? "";
        const modifiers = Object.fromEntries(
          MODIFIER_KEYS.map((modifier) => [modifier, parts.includes(modifier)]),
        );

        return [id, { ...modifiers, key: KEY_ALIASES[rawKey] ?? rawKey }];
      }),
  );

export function matchesKeybinding(
  event: KeyboardEvent,
  bindingId: KeyBinding,
): boolean {
  const binding = parsedBindings[bindingId];
  if (!binding) {
    return false;
  }

  return (
    event.key?.toLowerCase() === binding.key &&
    !!(event.ctrlKey || event.metaKey) === binding.ctrl &&
    !!event.shiftKey === binding.shift &&
    !!event.altKey === binding.alt
  );
}
