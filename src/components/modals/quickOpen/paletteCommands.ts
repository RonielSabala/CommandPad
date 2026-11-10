import { QuickOpenConfig } from "@/common/config";
import {
  AppMode,
  PaletteCommand,
  PanelId,
  QueryMatch,
  RunbookView,
} from "@/common/enums";
import { KeyBinding } from "@/common/keybindings";
import type { Messages } from "@/i18n/types";
import type { StoreState } from "@/store/store";
import { queryMatch } from "@/utils/string";

interface PaletteCommandDefinition {
  binding?: KeyBinding;
  /** Read mode hides it. */
  edits?: boolean;
  isAvailable?: (state: StoreState) => boolean;
  run: (state: StoreState) => void;
}

const hasTab = (state: StoreState) => state.tabs.length > 0;

export const PALETTE_COMMANDS: Record<
  PaletteCommand,
  PaletteCommandDefinition
> = {
  [PaletteCommand.NEW_RUNBOOK]: {
    binding: KeyBinding.NEW_TAB,
    edits: true,
    run: (state) => void state.createNewTab(),
  },
  [PaletteCommand.NEW_FOLDER]: {
    edits: true,
    run: (state) => state.createLibraryFolder(null),
  },
  [PaletteCommand.IMPORT_RUNBOOKS]: {
    binding: KeyBinding.IMPORT_RUNBOOK,
    edits: true,
    run: (state) => state.beginImport(),
  },
  [PaletteCommand.PASTE_RUNBOOK]: {
    edits: true,
    run: (state) => state.openPasteRunbookModal(),
  },
  [PaletteCommand.TOGGLE_MODE]: {
    binding: KeyBinding.TOGGLE_MODE,
    run: (state) => state.toggleAppMode(),
  },
  [PaletteCommand.TOGGLE_FOLDING]: {
    binding: KeyBinding.TOGGLE_EDITORS,
    isAvailable: hasTab,
    run: (state) => state.toggleCollapseAll(),
  },
  [PaletteCommand.TOGGLE_VARIABLES_VIEW]: {
    binding: KeyBinding.TOGGLE_VARIABLES_VIEW,
    isAvailable: hasTab,
    run: (state) => state.toggleRunbookView(RunbookView.VARIABLES),
  },
  [PaletteCommand.TOGGLE_SOURCE_VIEW]: {
    binding: KeyBinding.TOGGLE_SOURCE_VIEW,
    isAvailable: hasTab,
    run: (state) => state.toggleRunbookView(RunbookView.SOURCE),
  },
  [PaletteCommand.TOGGLE_SIDEBAR]: {
    run: (state) => state.togglePanel(PanelId.SIDEBAR),
  },
  [PaletteCommand.MOVE_SIDEBAR]: {
    run: (state) => state.togglePanelSide(PanelId.SIDEBAR),
  },
  [PaletteCommand.TOGGLE_THEME]: {
    run: (state) => state.toggleTheme(),
  },
  [PaletteCommand.TOGGLE_MINIMAP]: {
    run: (state) => state.toggleMinimap(),
  },
  [PaletteCommand.MOVE_MINIMAP]: {
    isAvailable: (state) => state.minimapEnabled,
    run: (state) => state.toggleMinimapPosition(),
  },
  [PaletteCommand.TOGGLE_SPELLCHECK]: {
    run: (state) => state.toggleSpellcheck(),
  },
};

const COMMAND_ORDER = Object.values(PaletteCommand);

/** The search after the command prefix. */
export function commandSearch(query: string): string | null {
  return query.startsWith(QuickOpenConfig.COMMAND_PREFIX)
    ? query.slice(QuickOpenConfig.COMMAND_PREFIX.length).trim()
    : null;
}

/** The commands that can run in `state`. */
export function availableCommands(state: StoreState): PaletteCommand[] {
  const reading = state.mode === AppMode.READ;

  return COMMAND_ORDER.filter((command) => {
    const { edits, isAvailable } = PALETTE_COMMANDS[command];

    return !(edits && reading) && (isAvailable?.(state) ?? true);
  });
}

/** Every command `query` finds. */
export function foundCommands(
  commands: readonly PaletteCommand[],
  query: string,
  t: Messages,
): PaletteCommand[] {
  const found: { command: PaletteCommand; match: QueryMatch }[] = [];

  for (const command of commands) {
    const match = queryMatch(query, t.quickOpen.commands[command]);
    if (match !== QueryMatch.ELSEWHERE) {
      found.push({ command, match });
    }
  }

  return found.sort((a, b) => a.match - b.match).map(({ command }) => command);
}
