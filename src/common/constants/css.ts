/**
 * Class names that are toggled from TS (body/root flags, drag & selection
 * state, sync pulses, etc.). Static presentational classes live inline in JSX;
 * the CSS files remain the source of truth for styling.
 */
export const CssClass = {
  // Root / body flags
  APP_READY: 'app-ready',
  READ_MODE: 'read-mode',
  CTRL_HELD: 'ctrl-held',
  ALT_HELD: 'alt-held',
  THEME_LIGHT: 'theme-light',
  SELECTING: 'selecting',

  // Shell / sidebar
  SIDEBAR_COLLAPSED: 'sidebar-collapsed',
  SIDEBAR_RIGHT: 'sidebar-right',
  COLLAPSED: 'collapsed',

  // Drag & drop
  DRAGGING: 'dragging',
  DRAG_OVER: 'drag-over',
  DRAG_OVER_LEFT: 'drag-over-left',
  DRAG_OVER_RIGHT: 'drag-over-right',

  // Blocks
  BLOCK_ITEM: 'block-item',
  BLOCK_CONTROLS: 'block-controls',
  BLOCK_DRAG_HANDLE: 'block-drag-handle',
  BLOCK_SELECTED: 'block-selected',
  DUPLICATE_FLASH: 'duplicate-flash',
  IS_FOCUSED: 'is-focused',
  EDITOR_COLLAPSED: 'editor-collapsed',
  HAS_UNRESOLVED: 'has-unresolved',

  // Tabs
  TAB: 'tab',
  TAB_ACTIVE: 'tab-active',

  // Rows / lists
  ACTIVE: 'active',
  RUNBOOK_FOCUSED: 'runbook-focused',
  SIDEBAR_SECTION_ROW: 'sidebar-section-row',
  VAR_SECRET: 'is-secret',
  VAR_SECRET_BTN_ACTIVE: 'is-active',

  // Misc
  SYNCING: 'is-syncing',
  MODAL_VISIBLE: 'modal-visible',
  BTN_DISABLED: 'btn-disabled',
} as const;
