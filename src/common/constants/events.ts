// Event types

export const EventType = {
  // Pointer
  POINTER_DOWN: "pointerdown",
  POINTER_UP: "pointerup",
  POINTER_MOVE: "pointermove",
  POINTER_OVER: "pointerover",
  POINTER_OUT: "pointerout",

  // Mouse
  CLICK: "click",
  MOUSE_DOWN: "mousedown",
  MOUSE_UP: "mouseup",
  MOUSE_MOVE: "mousemove",
  MOUSE_ENTER: "mouseenter",
  MOUSE_LEAVE: "mouseleave",
  MOUSE_OVER: "mouseover",

  // Keyboard
  KEY_DOWN: "keydown",
  KEY_UP: "keyup",

  // Focus
  FOCUS_IN: "focusin",
  FOCUS_OUT: "focusout",
  BLUR: "blur",

  // Forms
  CHANGE: "change",

  // Scrolling
  SCROLL: "scroll",
  WHEEL: "wheel",

  // Dragging
  DRAG_START: "dragstart",
  DRAG_END: "dragend",

  // Window and document
  RESIZE: "resize",
  HASH_CHANGE: "hashchange",
  SELECTION_CHANGE: "selectionchange",
} as const;

// Listener options

/** A listener that never calls `preventDefault`. */
export const PASSIVE = { passive: true } as const;

/** In capture, so a listener on `window` runs before any other. */
export const CAPTURE = { capture: true } as const;

/** Passive, in capture, so a scroll on an inner scroller counts too. */
export const PASSIVE_CAPTURE = { passive: true, capture: true } as const;

// Keys

export const Key = {
  // Modifiers
  CONTROL: "Control",
  ALT: "Alt",
  ALT_GRAPH: "AltGraph",
  SHIFT: "Shift",
  META: "Meta",

  // Editing
  ENTER: "Enter",
  ESCAPE: "Escape",
  SPACE: " ",
  TAB: "Tab",

  // Arrows
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
} as const;

export const Modifier = {
  ALT: "alt",
  CTRL: "ctrl",
  SHIFT: "shift",
} as const;
export type Modifier = (typeof Modifier)[keyof typeof Modifier];

// Mouse buttons

export const MouseButton = {
  LEFT: 0,
  MIDDLE: 1,
} as const;

/** The `buttons` bitmask. */
export const MouseButtons = {
  LEFT: 1,
} as const;

/** The `detail` of a mouse event. */
export const ClickCount = {
  SINGLE: 1,
} as const;

// Drag and drop

export const DragEffect = {
  MOVE: "move",
  COPY: "copy",
  COPY_MOVE: "copyMove",
} as const;

export const DataTransferType = {
  FILES: "Files",
} as const;
