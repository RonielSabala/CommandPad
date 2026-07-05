export const EventType = {
  CLICK: "click",
  KEY_DOWN: "keydown",
  KEY_UP: "keyup",
  MOUSE_UP: "mouseup",
  MOUSE_DOWN: "mousedown",
  MOUSE_MOVE: "mousemove",
  SCROLL: "scroll",
  DRAG_END: "dragend",
  BLUR: "blur",
  FOCUS: "focus",
} as const;

export const Key = {
  CTRL: "Control",
  ALT: "Alt",
  ENTER: "Enter",
  ESCAPE: "Escape",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
} as const;

export const Modifier = {
  ALT: "alt",
  CTRL: "ctrl",
  SHIFT: "shift",
} as const;
export type Modifier = (typeof Modifier)[keyof typeof Modifier];

export const MouseButton = {
  LEFT: 0,
  MIDDLE: 1,
} as const;

export const DragEffect = {
  MOVE: "move",
} as const;
