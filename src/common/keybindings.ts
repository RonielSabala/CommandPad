import { upperFirst } from "../utils/stringCase";
import { Key, Modifier } from "./constants/events";

// Types

interface KeybindingDef {
  binding: string | null;
  /** `false` for a gesture described in words. */
  keyboard?: boolean;
}

type ModifierState = Pick<
  KeyboardEvent,
  "altKey" | "ctrlKey" | "metaKey" | "shiftKey"
>;

export type KeyChordEvent = ModifierState & Pick<KeyboardEvent, "key">;

/** A user's bindings. */
export type KeybindingOverrides = Partial<Record<KeyBinding, string | null>>;

// Constants

const BINDING_SEPARATOR = "+";
const GESTURE_SEPARATOR = " ";
export const SPACED_BINDING_SEPARATOR = ` ${BINDING_SEPARATOR} `;

const MODIFIER_KEYS = [Modifier.CTRL, Modifier.ALT, Modifier.SHIFT] as const;
const MODIFIER_ONLY_KEYS: ReadonlySet<string> = new Set([
  Key.CONTROL,
  Key.ALT,
  Key.ALT_GRAPH,
  Key.SHIFT,
  Key.META,
]);

const KEY_ALIASES: Record<string, string> = {
  [Key.SPACE]: "space",
  [BINDING_SEPARATOR]: "plus",
};
const KEY_LABELS: Record<string, string> = {
  delete: "Del",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
};

export const ModifierAction = {
  OPEN_LINK: Modifier.CTRL,
  SELECT_BLOCKS: Modifier.SHIFT,
} as const;

export const KeyBinding = {
  TOGGLE_MODE: "TOGGLE_MODE",
  ESCAPE: "ESCAPE",
  SAVE_RUNBOOK: "SAVE_RUNBOOK",
  NEW_TAB: "NEW_TAB",
  CLOSE_TAB: "CLOSE_TAB",
  QUICK_OPEN: "QUICK_OPEN",
  COMMAND_PALETTE: "COMMAND_PALETTE",
  FOCUS_RUNBOOK: "FOCUS_RUNBOOK",
  NAVIGATE_RUNBOOKS: "NAVIGATE_RUNBOOKS",
  IMPORT_RUNBOOK: "IMPORT_RUNBOOK",
  NEW_FOLDER: "NEW_FOLDER",
  PASTE_RUNBOOK: "PASTE_RUNBOOK",
  EXPORT: "EXPORT",
  DELETE_RUNBOOK: "DELETE_RUNBOOK",
  DELETE_ACTIVE_RUNBOOK: "DELETE_ACTIVE_RUNBOOK",
  TOGGLE_EDITORS: "TOGGLE_EDITORS",
  TOGGLE_VARIABLES_VIEW: "TOGGLE_VARIABLES_VIEW",
  TOGGLE_SOURCE_VIEW: "TOGGLE_SOURCE_VIEW",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
  MOVE_SIDEBAR: "MOVE_SIDEBAR",
  TOGGLE_THEME: "TOGGLE_THEME",
  TOGGLE_MINIMAP: "TOGGLE_MINIMAP",
  MOVE_MINIMAP: "MOVE_MINIMAP",
  TOGGLE_SPELLCHECK: "TOGGLE_SPELLCHECK",
  OPEN_SETTINGS: "OPEN_SETTINGS",
  MULTISELECT_BLOCKS: "MULTISELECT_BLOCKS",
  DUPLICATE_BLOCK: "DUPLICATE_BLOCK",
  DELETE_BLOCK: "DELETE_BLOCK",
  OPEN_LINK: "OPEN_LINK",
  NOTE_BOLD: "NOTE_BOLD",
  NOTE_ITALIC: "NOTE_ITALIC",
  NOTE_STRIKETHROUGH: "NOTE_STRIKETHROUGH",
  NOTE_CODE: "NOTE_CODE",
  NOTE_NUMBERED_LIST: "NOTE_NUMBERED_LIST",
  NOTE_BULLETED_LIST: "NOTE_BULLETED_LIST",
  WRAP_SELECTION: "WRAP_SELECTION",
  SUBMIT_EDITOR: "SUBMIT_EDITOR",
} as const;
export type KeyBinding = (typeof KeyBinding)[keyof typeof KeyBinding];

export const KEYBINDINGS: Record<KeyBinding, KeybindingDef> = {
  [KeyBinding.TOGGLE_MODE]: { binding: "ctrl+e" },
  [KeyBinding.ESCAPE]: { binding: "escape" },
  [KeyBinding.SAVE_RUNBOOK]: { binding: "ctrl+s" },
  [KeyBinding.NEW_TAB]: { binding: "ctrl+alt+n" },
  [KeyBinding.CLOSE_TAB]: { binding: "ctrl+alt+w" },
  [KeyBinding.QUICK_OPEN]: { binding: "ctrl+l" },
  [KeyBinding.COMMAND_PALETTE]: { binding: "ctrl+shift+p" },
  [KeyBinding.FOCUS_RUNBOOK]: { binding: "tab" },
  [KeyBinding.NAVIGATE_RUNBOOKS]: { binding: "↑ / ↓", keyboard: false },
  [KeyBinding.IMPORT_RUNBOOK]: { binding: "ctrl+i" },
  [KeyBinding.NEW_FOLDER]: { binding: null },
  [KeyBinding.PASTE_RUNBOOK]: { binding: null },
  [KeyBinding.EXPORT]: { binding: "ctrl+shift+e" },
  [KeyBinding.DELETE_RUNBOOK]: { binding: "ctrl+shift+d" },
  [KeyBinding.DELETE_ACTIVE_RUNBOOK]: { binding: "ctrl+shift+backspace" },
  [KeyBinding.TOGGLE_EDITORS]: { binding: "ctrl+g" },
  [KeyBinding.TOGGLE_VARIABLES_VIEW]: { binding: "ctrl+shift+v" },
  [KeyBinding.TOGGLE_SOURCE_VIEW]: { binding: "ctrl+shift+c" },
  [KeyBinding.TOGGLE_SIDEBAR]: { binding: "ctrl+b" },
  [KeyBinding.MOVE_SIDEBAR]: { binding: null },
  [KeyBinding.TOGGLE_THEME]: { binding: null },
  [KeyBinding.TOGGLE_MINIMAP]: { binding: null },
  [KeyBinding.MOVE_MINIMAP]: { binding: null },
  [KeyBinding.TOGGLE_SPELLCHECK]: { binding: null },
  [KeyBinding.OPEN_SETTINGS]: { binding: "ctrl+," },
  [KeyBinding.MULTISELECT_BLOCKS]: {
    binding: `${ModifierAction.SELECT_BLOCKS}+click / drag`,
    keyboard: false,
  },
  [KeyBinding.DUPLICATE_BLOCK]: { binding: "ctrl+d" },
  [KeyBinding.DELETE_BLOCK]: { binding: "delete" },
  [KeyBinding.OPEN_LINK]: {
    binding: `${ModifierAction.OPEN_LINK}+click`,
    keyboard: false,
  },
  [KeyBinding.NOTE_BOLD]: { binding: "ctrl+b", keyboard: false },
  [KeyBinding.NOTE_ITALIC]: { binding: "ctrl+i", keyboard: false },
  [KeyBinding.NOTE_STRIKETHROUGH]: {
    binding: "ctrl+shift+x",
    keyboard: false,
  },
  [KeyBinding.NOTE_CODE]: { binding: "ctrl+´", keyboard: false },
  [KeyBinding.NOTE_NUMBERED_LIST]: {
    binding: "ctrl+shift+7",
    keyboard: false,
  },
  [KeyBinding.NOTE_BULLETED_LIST]: {
    binding: "ctrl+shift+8",
    keyboard: false,
  },
  [KeyBinding.WRAP_SELECTION]: {
    binding: `( [ { " '`,
    keyboard: false,
  },
  [KeyBinding.SUBMIT_EDITOR]: { binding: "ctrl+enter" },
};

export const KEYBINDING_IDS = Object.keys(KEYBINDINGS) as KeyBinding[];

const PRESSABLE_KEYBINDINGS = KEYBINDING_IDS.filter(
  (id) => KEYBINDINGS[id].keyboard !== false,
);

export const REBINDABLE_KEYBINDINGS = PRESSABLE_KEYBINDINGS.filter(
  (id) => id !== KeyBinding.ESCAPE,
);

// Chords

export function isModifierPressed(
  event: ModifierState,
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

/** The chord a key press spells. */
export function chordFromEvent(event: KeyChordEvent): string | null {
  if (!event.key || MODIFIER_ONLY_KEYS.has(event.key)) {
    return null;
  }

  const key = event.key.toLowerCase();
  const modifiers = MODIFIER_KEYS.filter((modifier) =>
    isModifierPressed(event, modifier),
  );

  return [...modifiers, KEY_ALIASES[key] ?? key].join(BINDING_SEPARATOR);
}

/** `chord` spelled the way `chordFromEvent` spells it. */
function canonicalChord(chord: string): string {
  const tokens = chord.toLowerCase().split(BINDING_SEPARATOR);
  const key = tokens.pop() ?? "";
  const modifiers = MODIFIER_KEYS.filter((modifier) =>
    tokens.includes(modifier),
  );

  return [...modifiers, key].join(BINDING_SEPARATOR);
}

// Labels

function chordLabel(chord: string, joiner: string): string {
  return chord
    .split(BINDING_SEPARATOR)
    .map((token) => KEY_LABELS[token] ?? upperFirst(token))
    .join(joiner);
}

/** How `binding` reads; a gesture labels each of its words as a chord. */
function labelOf(binding: string | null, joiner: string): string {
  return binding === null
    ? ""
    : binding
        .split(GESTURE_SEPARATOR)
        .map((part) => chordLabel(part, joiner))
        .join(GESTURE_SEPARATOR);
}

// Overrides

function bindingIn(
  overrides: KeybindingOverrides,
  id: KeyBinding,
): string | null {
  const override = overrides[id];
  return override === undefined ? KEYBINDINGS[id].binding : override;
}

/** The rebindable actions besides `id` that `chord` runs under `overrides`. */
export function bindingConflicts(
  chord: string,
  id: KeyBinding,
  overrides: KeybindingOverrides = activeOverrides,
): KeyBinding[] {
  const target = canonicalChord(chord);

  return REBINDABLE_KEYBINDINGS.filter((other) => {
    const binding = bindingIn(overrides, other);
    return (
      other !== id && binding !== null && canonicalChord(binding) === target
    );
  });
}

/** `overrides` with `id` bound to `chord`. */
export function withKeybinding(
  overrides: KeybindingOverrides,
  id: KeyBinding,
  chord: string | null,
): KeybindingOverrides {
  const next = { ...overrides };
  const assign = (target: KeyBinding, binding: string | null) => {
    if (binding === KEYBINDINGS[target].binding) {
      delete next[target];
    } else {
      next[target] = binding;
    }
  };

  if (chord === null) {
    assign(id, null);
    return next;
  }

  for (const other of bindingConflicts(chord, id, overrides)) {
    assign(other, null);
  }

  assign(id, canonicalChord(chord));
  return next;
}

// The registry: the effective bindings every reader goes through

let activeOverrides: KeybindingOverrides = {};
let actionByChord = indexChords(activeOverrides);
let version = 0;
const listeners = new Set<() => void>();

/** The action each pressable chord runs under `overrides`. */
function indexChords(overrides: KeybindingOverrides): Map<string, KeyBinding> {
  const index = new Map<string, KeyBinding>();

  for (const id of PRESSABLE_KEYBINDINGS) {
    const binding = bindingIn(overrides, id);

    if (binding !== null) {
      index.set(canonicalChord(binding), id);
    }
  }

  return index;
}

export function applyKeybindingOverrides(overrides: KeybindingOverrides): void {
  activeOverrides = overrides;
  actionByChord = indexChords(overrides);
  version += 1;
  listeners.forEach((listener) => listener());
}

export function getKeybindingsVersion(): number {
  return version;
}

export function subscribeKeybindings(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The action a key press runs, if any. */
export function keybindingFromEvent(
  event: KeyChordEvent,
): KeyBinding | undefined {
  const chord = chordFromEvent(event);
  return chord === null ? undefined : actionByChord.get(chord);
}

export function matchesKeybinding(
  event: KeyChordEvent,
  id: KeyBinding,
): boolean {
  return keybindingFromEvent(event) === id;
}

/** How `id`'s shortcut reads. */
export function bindingLabel(
  id: KeyBinding,
  joiner: string = BINDING_SEPARATOR,
): string {
  return labelOf(bindingIn(activeOverrides, id), joiner);
}

/** How `id`'s shortcut reads before the user changes it. */
export function defaultBindingLabel(
  id: KeyBinding,
  joiner: string = BINDING_SEPARATOR,
): string {
  return labelOf(KEYBINDINGS[id].binding, joiner);
}
