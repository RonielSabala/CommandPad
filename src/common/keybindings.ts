import { toTitleCase } from "../utils/string";
import { Modifier } from "./constants/events";

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
  CLEAR_WORKSPACE: "CLEAR_WORKSPACE",
  FOCUS_RUNBOOK: "FOCUS_RUNBOOK",
  NAVIGATE_RUNBOOKS: "NAVIGATE_RUNBOOKS",
  ALT_CLICK_LINK: "ALT_CLICK_LINK",
  MULTISELECT_BLOCKS: "MULTISELECT_BLOCKS",
} as const;
export type KeyBinding = (typeof KeyBinding)[keyof typeof KeyBinding];

interface KeybindingDef {
  binding: string;
  description: string;
  keyboard?: boolean;
}

export const KEYBINDINGS: Record<KeyBinding, KeybindingDef> = {
  [KeyBinding.TOGGLE_MODE]: {
    binding: "ctrl+e",
    description: "Toggle read / edit mode",
  },
  [KeyBinding.NEW_TAB]: {
    binding: "ctrl+alt+n",
    description: "Open a new tab",
  },
  [KeyBinding.CLOSE_TAB]: {
    binding: "ctrl+alt+w",
    description: "Close the active tab",
  },
  [KeyBinding.TOGGLE_EDITORS]: {
    binding: "ctrl+g",
    description: "Toggle all command editors",
  },
  [KeyBinding.DELETE_RUNBOOK]: {
    binding: "ctrl+shift+d",
    description: "Delete the focused runbook from the library",
  },
  [KeyBinding.IMPORT_RUNBOOK]: {
    binding: "ctrl+i",
    description: "Open runbook import dialog",
  },
  [KeyBinding.TOGGLE_SIDEBAR]: {
    binding: "ctrl+s",
    description: "Collapse / expand sidebar",
  },
  [KeyBinding.MOVE_SIDEBAR]: {
    binding: "ctrl+shift+s",
    description: "Move sidebar to left / right",
  },
  [KeyBinding.DUPLICATE_BLOCK]: {
    binding: "ctrl+d",
    description: "Duplicate selected blocks",
  },
  [KeyBinding.DELETE_BLOCK]: {
    binding: "delete",
    description: "Delete selected blocks",
  },
  [KeyBinding.ESCAPE]: {
    binding: "escape",
    description: "Clear block selection / close modals",
  },
  [KeyBinding.EXPORT]: {
    binding: "ctrl+shift+e",
    description: "Open export dialog",
  },
  [KeyBinding.CLEAR_WORKSPACE]: {
    binding: "ctrl+shift+backspace",
    description: "Open clear workspace dialog",
  },
  [KeyBinding.FOCUS_RUNBOOK]: {
    binding: "tab",
    description: "Select active runbook",
  },
  [KeyBinding.NAVIGATE_RUNBOOKS]: {
    binding: "↑ / ↓",
    description: "Navigate runbooks when selected active runbook",
    keyboard: false,
  },
  [KeyBinding.ALT_CLICK_LINK]: {
    binding: "alt+click",
    description: "Open note link in new tab",
    keyboard: false,
  },
  [KeyBinding.MULTISELECT_BLOCKS]: {
    binding: "ctrl+click / drag",
    description: "Multi-select blocks",
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
