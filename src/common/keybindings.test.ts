import { afterEach, describe, expect, it } from "vitest";

import {
  applyKeybindingOverrides,
  bindingConflicts,
  bindingLabel,
  chordFromEvent,
  defaultBindingLabel,
  KeyBinding,
  keybindingFromEvent,
  KEYBINDINGS,
  matchesKeybinding,
  REBINDABLE_KEYBINDINGS,
  withKeybinding,
  type KeyChordEvent,
} from "./keybindings";

type Held = Partial<Omit<KeyChordEvent, "key">>;

function press(key: string, held: Held = {}): KeyChordEvent {
  return {
    key,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    ...held,
  };
}

afterEach(() => applyKeybindingOverrides({}));

describe("chordFromEvent", () => {
  it.each([
    [press("k"), "k"],
    [press("K", { ctrlKey: true, shiftKey: true }), "ctrl+shift+k"],
    [press("n", { altKey: true, ctrlKey: true }), "ctrl+alt+n"],
    [
      press("n", { shiftKey: true, altKey: true, ctrlKey: true }),
      "ctrl+alt+shift+n",
    ],
    [press("s", { metaKey: true }), "ctrl+s"],
    [press(" ", { ctrlKey: true }), "ctrl+space"],
    [press("+", { ctrlKey: true }), "ctrl+plus"],
    [press("Delete"), "delete"],
  ])("reads %o as %s", (event, chord) => {
    expect(chordFromEvent(event)).toBe(chord);
  });

  it.each(["Control", "Shift", "Alt", "AltGraph", "Meta", ""])(
    "keeps waiting while only %o is down",
    (key) => {
      expect(chordFromEvent(press(key, { ctrlKey: true }))).toBeNull();
    },
  );
});

describe("the defaults", () => {
  it("are written the way a key press spells them, and never collide", () => {
    for (const id of REBINDABLE_KEYBINDINGS) {
      expect(withKeybinding({}, id, KEYBINDINGS[id].binding)).toEqual({});
    }
  });

  it("leave Escape and the gestures out of what can be rebound", () => {
    expect(REBINDABLE_KEYBINDINGS).not.toContain(KeyBinding.ESCAPE);
    expect(REBINDABLE_KEYBINDINGS).not.toContain(KeyBinding.NAVIGATE_RUNBOOKS);
    expect(REBINDABLE_KEYBINDINGS).not.toContain(KeyBinding.NOTE_BOLD);
  });
});

describe("matchesKeybinding", () => {
  it("matches the default chord exactly", () => {
    expect(
      matchesKeybinding(press("l", { ctrlKey: true }), KeyBinding.QUICK_OPEN),
    ).toBe(true);

    expect(
      matchesKeybinding(
        press("L", { ctrlKey: true, shiftKey: true }),
        KeyBinding.QUICK_OPEN,
      ),
    ).toBe(false);
  });

  it("follows an override and drops the old chord", () => {
    applyKeybindingOverrides({ [KeyBinding.QUICK_OPEN]: "ctrl+k" });

    expect(
      matchesKeybinding(press("k", { ctrlKey: true }), KeyBinding.QUICK_OPEN),
    ).toBe(true);

    expect(
      matchesKeybinding(press("l", { ctrlKey: true }), KeyBinding.QUICK_OPEN),
    ).toBe(false);
    expect(bindingLabel(KeyBinding.QUICK_OPEN)).toBe("Ctrl+K");
  });

  it("reads a stored chord whatever order its modifiers come in", () => {
    applyKeybindingOverrides({ [KeyBinding.QUICK_OPEN]: "shift+ctrl+k" });

    expect(
      matchesKeybinding(
        press("K", { ctrlKey: true, shiftKey: true }),
        KeyBinding.QUICK_OPEN,
      ),
    ).toBe(true);
  });

  it("never matches an unbound action, which shows no label", () => {
    applyKeybindingOverrides({ [KeyBinding.QUICK_OPEN]: null });

    expect(
      matchesKeybinding(press("l", { ctrlKey: true }), KeyBinding.QUICK_OPEN),
    ).toBe(false);
    expect(bindingLabel(KeyBinding.QUICK_OPEN)).toBe("");
    expect(bindingLabel(KeyBinding.TOGGLE_THEME)).toBe("");
  });
});

describe("labels", () => {
  it("label each word of a gesture as a chord and keep symbols", () => {
    expect(defaultBindingLabel(KeyBinding.MULTISELECT_BLOCKS)).toBe(
      "Shift+Click / Drag",
    );
    expect(defaultBindingLabel(KeyBinding.WRAP_SELECTION)).toBe(`( [ { " '`);
    expect(defaultBindingLabel(KeyBinding.DELETE_BLOCK, " + ")).toBe("Del");
  });
});

describe("keybindingFromEvent", () => {
  it("finds the action a press runs, or none", () => {
    expect(keybindingFromEvent(press("s", { ctrlKey: true }))).toBe(
      KeyBinding.SAVE_RUNBOOK,
    );
    expect(keybindingFromEvent(press("q", { ctrlKey: true }))).toBeUndefined();
  });

  it("never finds a gesture, even one spelled like a chord", () => {
    applyKeybindingOverrides({ [KeyBinding.TOGGLE_SIDEBAR]: null });

    expect(keybindingFromEvent(press("b", { ctrlKey: true }))).toBeUndefined();
  });
});

describe("bindingConflicts", () => {
  it("names the other action a chord already runs", () => {
    expect(bindingConflicts("ctrl+l", KeyBinding.TOGGLE_THEME)).toEqual([
      KeyBinding.QUICK_OPEN,
    ]);
    expect(bindingConflicts("ctrl+l", KeyBinding.QUICK_OPEN)).toEqual([]);
  });

  it("reads the overrides it is given", () => {
    const overrides = { [KeyBinding.QUICK_OPEN]: null };
    expect(
      bindingConflicts("ctrl+l", KeyBinding.TOGGLE_THEME, overrides),
    ).toEqual([]);
  });
});

describe("withKeybinding", () => {
  it("moves a taken chord, unbinding the action that had it", () => {
    expect(withKeybinding({}, KeyBinding.TOGGLE_THEME, "ctrl+l")).toEqual({
      [KeyBinding.TOGGLE_THEME]: "ctrl+l",
      [KeyBinding.QUICK_OPEN]: null,
    });
  });

  it("stores only what differs from the defaults", () => {
    const moved = withKeybinding({}, KeyBinding.TOGGLE_THEME, "ctrl+l");
    expect(withKeybinding(moved, KeyBinding.QUICK_OPEN, "ctrl+l")).toEqual({});
  });

  it("unbinds with null", () => {
    expect(withKeybinding({}, KeyBinding.QUICK_OPEN, null)).toEqual({
      [KeyBinding.QUICK_OPEN]: null,
    });
  });
});
