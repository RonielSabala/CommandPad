export const EventType = {
  CLICK: "click",
  KEY_DOWN: "keydown",
  KEY_UP: "keyup",
  MOUSE_UP: "mouseup",
  MOUSE_DOWN: "mousedown",
  MOUSE_MOVE: "mousemove",
  MOUSE_ENTER: "mouseenter",
  MOUSE_LEAVE: "mouseleave",
  POINTER_UP: "pointerup",
  POINTER_MOVE: "pointermove",
  SCROLL: "scroll",
  WHEEL: "wheel",
  BLUR: "blur",
} as const;

export const Key = {
  CTRL: "Control",
  ALT: "Alt",
  SHIFT: "Shift",
  ENTER: "Enter",
  ESCAPE: "Escape",
  TAB: "Tab",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
} as const;

export const TAB_CHARACTER = "\t";

export const Modifier = {
  ALT: "alt",
  CTRL: "ctrl",
  SHIFT: "shift",
} as const;
export type Modifier = (typeof Modifier)[keyof typeof Modifier];

export const ModifierKeyName: Record<Modifier, string> = {
  [Modifier.ALT]: Key.ALT,
  [Modifier.CTRL]: Key.CTRL,
  [Modifier.SHIFT]: Key.SHIFT,
};

export const MouseButton = {
  LEFT: 0,
  MIDDLE: 1,
} as const;

export const DragEffect = {
  MOVE: "move",
  COPY: "copy",
  COPY_MOVE: "copyMove",
} as const;

export const DataTransferType = {
  FILES: "Files",
} as const;
